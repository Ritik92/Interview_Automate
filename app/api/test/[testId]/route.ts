import prisma from '@/lib/prisma';
import { TestStatus } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { testId: string } }
  ) {
    try {
      let session = { user: { id: 'cm70xj8tz0001we40y8m2p2l3' } }; // Replace with your auth logic
      const data = await req.json();
  
      // Validate the test belongs to the user
      const test = await prisma.test.findFirst({
        where: {
          id: params.testId,
          createdById: session.user.id,
        },
      });
  
      if (!test) {
        return NextResponse.json(
          { error: 'Test not found' },
          { status: 404 }
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