import { authOptions } from '@/auth.config';
import prisma from '@/lib/prisma';
import { TestStatus } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
    req: NextRequest,
    { params }: { params: any }
  ) {
    try {
      
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      const data = await req.json();
  
      // Validate the test belongs to the user
      const test = await prisma.test.findFirst({
        where: {
          id: params.testId,
          //@ts-ignore
          createdById: session.user.id,
        },
      });
  
      if (!test) {
        return NextResponse.json(
          { error: 'Test not found' },
          { status: 401 }
        );
      }
  
      // Update test status
      const updatedTest = await prisma.test.update({
        where: {
          id: params.testId,
        },
        data: {
          status: data.status,
        },
      });
  
      return NextResponse.json({
        test: updatedTest,
      });
    } catch (error) {
      console.error('Error updating test:', error);
      return NextResponse.json(
        { error: 'Failed to update test' },
        { status: 500 }
      );
    }
  }