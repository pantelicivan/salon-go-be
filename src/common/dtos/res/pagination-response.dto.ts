export class PaginationDTO {
  limit: number;
  page: number;
  total_records: number;
  total_pages: number;
  has_more: boolean;

  constructor(limit: number, page: number, count: number) {
    this.limit = limit;
    this.page = page;
    this.total_records = count;
    const totalPages = Math.ceil(count / limit);
    this.total_pages = totalPages;
    this.has_more = totalPages > page;
  }
}
