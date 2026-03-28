import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = `${environment.apiUrl}/chats`;
  private messagesUrl = `${environment.apiUrl}/messages`;

  private selectedChatSubject = new BehaviorSubject<any>(null);
  public selectedChat$ = this.selectedChatSubject.asObservable();

  private chatsSubject = new BehaviorSubject<any[]>([]);
  public chats$ = this.chatsSubject.asObservable();

  constructor(private http: HttpClient) { }

  setSelectedChat(chat: any) {
    this.selectedChatSubject.next(chat);
  }
  
  getSelectedChat() {
    return this.selectedChatSubject.value;
  }

  setChats(chats: any[]) {
    this.chatsSubject.next(chats);
  }

  getChatsValue() {
    return this.chatsSubject.value;
  }

  fetchChats(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(chats => this.setChats(chats))
    );
  }

  accessChat(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/private`, { userId });
  }

  createGroup(name: string, users: any[], groupImage?: string): Observable<any> {
    const userIds = users.map(u => u._id);
    return this.http.post<any>(`${this.apiUrl}/group`, {
      name,
      users: JSON.stringify(userIds),
      groupImage
    });
  }

  renameGroup(chatId: string, chatName: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/group/${chatId}`, { chatName });
  }

  addToGroup(chatId: string, userId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/group/${chatId}/member`, { userId });
  }

  removeFromGroup(chatId: string, userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/group/${chatId}/member/${userId}`);
  }

  fetchMessages(chatId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.messagesUrl}/${chatId}`);
  }

  sendMessage(chatId: string, content?: string, fileUrl?: string, fileName?: string, messageType: string = 'text'): Observable<any> {
    return this.http.post<any>(this.messagesUrl, {
      chatId,
      content,
      fileUrl,
      fileName,
      messageType
    });
  }

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.messagesUrl}/upload`, formData);
  }

  markAsSeen(messageId: string): Observable<any> {
    return this.http.put<any>(`${this.messagesUrl}/${messageId}/seen`, {});
  }
}
