import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class PaginationMetadata {
  private _totalCount?: number;
  private _hasMetadata = false;

  public setTotalCount(totalCount: number): void {
    this._totalCount = totalCount;
    this._hasMetadata = true;
  }

  public getTotalCount(): number | undefined {
    return this._totalCount;
  }

  public hasMetadata(): boolean {
    return this._hasMetadata;
  }

  public clear(): void {
    this._totalCount = undefined;
    this._hasMetadata = false;
  }
}
