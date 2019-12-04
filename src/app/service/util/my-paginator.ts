import { MatPaginatorIntl } from '@angular/material';


const dutchRangeLabel = (page: number, pageSize: number, length: number) => {
  if (length === 0 || pageSize === 0) { return `0 到 ${length}`; }
  length = Math.max(length, 0);
  const startIndex = page * pageSize;
  const endIndex = startIndex < length ?
    Math.min(startIndex + pageSize, length) :
    startIndex + pageSize;
  return `${startIndex + 1} - ${endIndex} 条共 ${length}条`;

}

export function getDutchPaginatorIntl() {

  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = '每页显示数量:';

  paginatorIntl.nextPageLabel = '下一页:';

  paginatorIntl.previousPageLabel = '上一页:';

  paginatorIntl.getRangeLabel = dutchRangeLabel;

  return paginatorIntl;

}
