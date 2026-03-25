import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ShowingRequest, ShowingRequestStatus } from '../models/showing-request.model';
import { generateClient } from 'aws-amplify/api';

const client = generateClient();
const FIELDS = `id showingEventId saleItemId name contact status`;

@Injectable({ providedIn: 'root' })
export class ShowingRequestService {
  private requestsSubject = new BehaviorSubject<ShowingRequest[]>([]);
  requests$: Observable<ShowingRequest[]> = this.requestsSubject.asObservable();

  async loadRequests(): Promise<void> {
    try {
      const result: any = await client.graphql({
        query: `query ListShowingRequests { listShowingRequests { items { ${FIELDS} } } }`
      });
      this.requestsSubject.next(result.data.listShowingRequests.items);
    } catch (e) {
      console.warn('Could not load showing requests.', e);
    }
  }

  requestsForShowing(showingEventId: string): ShowingRequest[] {
    return this.requestsSubject.value.filter(r => r.showingEventId === showingEventId);
  }

  activeRequestsForShowing(showingEventId: string): ShowingRequest[] {
    return this.requestsForShowing(showingEventId).filter(r => r.status !== 'dismissed');
  }

  activeRequestForItem(saleItemId: string): ShowingRequest | null {
    return this.requestsSubject.value.find(
      r => r.saleItemId === saleItemId && (r.status === 'pending' || r.status === 'confirmed')
    ) ?? null;
  }

  activeRequestsForItem(saleItemId: string): ShowingRequest[] {
    return this.requestsSubject.value.filter(
      r => r.saleItemId === saleItemId && (r.status === 'pending' || r.status === 'confirmed')
    );
  }

  async createRequest(input: Omit<ShowingRequest, 'id' | 'status'>): Promise<void> {
    const result: any = await client.graphql({
      query: `mutation CreateShowingRequest($input: CreateShowingRequestInput!) {
        createShowingRequest(input: $input) { ${FIELDS} }
      }`,
      variables: { input: { ...input, status: 'pending' } }
    });
    const created = result.data.createShowingRequest;
    this.requestsSubject.next([...this.requestsSubject.value, created]);
  }

  async setStatus(id: string, status: ShowingRequestStatus): Promise<void> {
    await this.updateRequest(id, { status });
  }

  async updateRequest(id: string, changes: Partial<Omit<ShowingRequest, 'id'>>): Promise<void> {
    try {
      const result: any = await client.graphql({
        query: `mutation UpdateShowingRequest($input: UpdateShowingRequestInput!) {
          updateShowingRequest(input: $input) { ${FIELDS} }
        }`,
        variables: { input: { id, ...changes } }
      });
      const updated = result.data.updateShowingRequest;
      this.requestsSubject.next(this.requestsSubject.value.map(r => r.id === id ? updated : r));
    } catch (e) {
      console.warn('Could not update showing request.', e);
    }
  }

  async deleteRequest(id: string): Promise<void> {
    try {
      await client.graphql({
        query: `mutation DeleteShowingRequest($input: DeleteShowingRequestInput!) {
          deleteShowingRequest(input: $input) { id }
        }`,
        variables: { input: { id } }
      });
      this.requestsSubject.next(this.requestsSubject.value.filter(r => r.id !== id));
    } catch (e) {
      console.warn('Could not delete showing request.', e);
    }
  }
}
