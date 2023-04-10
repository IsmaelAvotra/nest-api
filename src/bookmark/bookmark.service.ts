import { Injectable } from '@nestjs/common';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
    getBookmarks(userId: number) {
        return 'getBookmarks';
    }

    getBookmarkById(userId :number, bookmarkId: number) {
        return 'getBookmarkById';
    }

    createBookmark(userId: number, dto: CreateBookmarkDto) {
        return 'createBookmark';
    }

    editBookmarkById(userId: number, dto: EditBookmarkDto) {
        return 'editBookmarkById';
    }

    deleteBookmarkById(userId: number, bookmarkId: number) {
        return 'deleteBookmarkById';
    }
}
