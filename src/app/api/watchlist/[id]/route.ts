import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Global variable to cache the Prisma client instance
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID parameter' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { watched, favorite, dateWatched, userRating } = body;

    // Check if item exists
    const existingItem = await prisma.watchlistItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Update the item
    const updatedItem = await prisma.watchlistItem.update({
      where: { id },
      data: {
        watched: watched !== undefined ? watched : existingItem.watched,
        favorite: favorite !== undefined ? favorite : existingItem.favorite,
        dateWatched: dateWatched !== undefined ? (dateWatched ? new Date(dateWatched) : null) : existingItem.dateWatched,
        userRating: userRating !== undefined ? userRating : existingItem.userRating,
      },
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error('Error updating watchlist item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid ID parameter' },
        { status: 400 }
      );
    }

    // Check if item exists
    const existingItem = await prisma.watchlistItem.findUnique({
      where: { id },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Delete the item
    await prisma.watchlistItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting watchlist item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
