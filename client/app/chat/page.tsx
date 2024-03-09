"use client"
import React, { useState, useEffect, useRef } from 'react';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  Avatar
} from "@/components/ui/avatar"
import { Separator } from '@/components/ui/separator';
import { io, Socket } from 'socket.io-client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatBox } from './components/chatbox';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';

interface UserData {
  _id: string;
  username: string;
  displayName: string;
}

interface Room {
  id: string;
  name: string;
  info: string;
}

interface Message {
  _id: string;
  name: string;
  content: string;
  timestamp: number;
}

interface PrivateMessage {
  _id: string;
  senderName: string;
  content: string;
  timestamp: number;
}

const ChatPage: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
    console.log('scroll set to bottom')
  }, [selectedUser, selectedRoom]);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const getMessagePartition = (timestamp: number): string => {
    const messageDate = new Date(timestamp).toDateString();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (messageDate === today) {
      return 'Today';
    } else if (messageDate === yesterday) {
      return 'Yesterday';
    } else {
      const date = new Date(timestamp);
      return `${date.toLocaleDateString('en-GB',  { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }
  };

  const sendMessage = (message: string): void => {
    if (selectedUser) {
      if (!privateMessages) {
        // Handle private messages if necessary
      }
      const joinData = {
        user1: selectedUser._id,
        user2: user?._id,
      };
      socket?.emit('join', joinData);
      const pvtMessage = {
        content: message,
        senderName: user?.displayName,
        recipientId: selectedUser._id,
        recipientName: selectedUser.displayName,
        joinData: joinData,
      };
      socket?.emit('private-message', pvtMessage);
    } else if (selectedRoom) {
      const roomMessage = {
        name: user?.displayName,
        room: selectedRoom.name,
        content: message,
      };
      socket?.emit('room-message', roomMessage);
    }
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/status', {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const userData: UserData = await response.json();
          setUser(userData);
          console.log(userData)
          const newSocket = io('http://localhost:5000');
          setSocket(newSocket);
          console.log('SOCKET-ID', newSocket.id);
        } else {
          setUser(null);
          router.push('/')
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
    };

    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (socket) {
      console.log(socket.id)
      socket.emit('send-id', user?._id);
      socket.emit('send-name', user?.displayName);
    }
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on('room-message', (msg: Message) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
      });
      socket.on('private-message', (msg: PrivateMessage) => {
        setPrivateMessages((prevMessages) => [...prevMessages, msg]);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchUsers();
      fetchRooms();
    }
  }, [user]);

  const fetchMessages = async (room?: string): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${room || ''}`);
      if (response.ok) {
        const messagesData = await response.json();
        setMessages(messagesData);
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchPrivateMessages = async (userId: string, friendId: string): Promise<void> => {
    try {
      const response = await fetch(`http://localhost:5000/api/privatemessages/${userId}/${friendId}`);
      if (response.ok) {
        const privateMessagesData = await response.json();
        setPrivateMessages(privateMessagesData);
      } else {
        console.error('Failed to fetch private messages');
      }
    } catch (error) {
      console.error('Error fetching private messages:', error);
    }
  };

  const fetchRooms = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5000/api/rooms');
      if (response.ok) {
        const roomsData = await response.json();
        setRooms(roomsData);
        console.log(roomsData);
      } else {
        console.error('Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const fetchUsers = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:5000/api/users');
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
        console.log(usersData);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleRoomClick = (room: Room): void => {
    setSelectedUser(null);
    setSelectedRoom(room);
    fetchMessages(room.name);
  };

  const handleUserClick = (selectedUser: UserData): void => {
    setSelectedRoom(null);
    setSelectedUser(selectedUser);
    fetchPrivateMessages(user?._id || '', selectedUser._id);
  };

  return (
    <div>
      <SiteHeader />
      <div className='container h-[700px] items-center md:col-span-1 lg:col-span-2 gap-6 pb-8 pt-6 md:py-10'>
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-full max-w-screen rounded-lg border"
      >
        <ResizablePanel defaultSize={25}>
          <div className="flex flex-col h-full font-normal">
            <span className="font-semibold px-6 pt-6 text-xs">CHANNELS</span>
            <div className='px-6 py-2 text-left flex flex-col'>
            {rooms.map((room) => (
              <Button
                key={room.id}
                onClick={() => handleRoomClick(room)}
                variant={`${
                  selectedRoom === room ? 'secondary' : 'ghost'
                }`}
                className='justify-start mb-1 px-2'
              >
                <Icons.hashTag className="h-5 w-5 fill-current" />
                <span>{room.name.toLowerCase()}</span>
              </Button>
            ))}
            </div>
            <Separator className="my-4" />
            <span className="font-semibold px-6 text-xs">USERS</span>
            <div className='px-6 py-2 text-left flex flex-col'>
            {users.map((usr) => (
              <Button
                key={usr._id}
                onClick={() => handleUserClick(usr)}
                variant={`${
                  selectedUser === usr ?  'secondary' : 'ghost'
                }`}
                className='justify-start items-center mb-1 px-2'
              >
                <Avatar className='h-7 w-7 mr-2 text-[12px]  bg-primary text-secondary justify-center items-center'>
                  {getInitials(usr.displayName)}
                </Avatar>
                {usr.displayName}
              </Button>
            ))}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={75}>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={20}>
            {selectedRoom ? (
              <div className='w-full p-4 mt-4'>
              <div className='flex flex-col items-center justify-center'>
                <h1 className='text-3xl font-bold mb-2'>Welcome to {selectedRoom.name}</h1>
                <p className='mb-4'>{selectedRoom.info}</p>
              </div>
              </div>
            ) : selectedUser ? (
              <div className='w-full p-4 px-8 mt-4'>
              <div className='flex flex-col'>
                <h1 className='text-3xl font-bold mb-2'>{selectedUser.displayName}</h1>
                <p className='mb-4'>@{selectedUser.username}</p>
              </div>
              </div>
            ) : (
              <p className="p-10 text-lg font-semibold">Select a user or room to start chatting</p>
            )}
            </ResizablePanel>
            <ResizablePanel defaultSize={70}>
            <ScrollArea className="h-full w-full mb-4 rounded-md p-4">
              <div className="p-4">
                {selectedUser ? (
                  <div className=''>
                    {privateMessages.map((msg, index) => (
                      <div key={index} >
                      {index === 0 || getMessagePartition(privateMessages[index].timestamp) !== getMessagePartition(privateMessages[index - 1].timestamp) ? (
                        <div className='flex items-center justify-center'>
                        <span className='border-t w-full'></span>
                        <p className="inline-block text-nowrap text-xs rounded-md font-semibold text-center px-2 py-1 m-2">{getMessagePartition(msg.timestamp)}</p>
                        <span className='border-t w-full'></span>
                        </div>
                      ) : null}
                      <div className="flex-cols items-center justify-center flex py-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-secondary rounded-full mr-2">
                        <span className="text-xs font-semibold">{getInitials(msg.senderName)}</span>
                      </div>
                      <div className='w-full'>
                      <div className='flex justify-between items-center'>
                          <p className="text-xs font-semibold">{msg.senderName}</p>
                          <p className='text-xs'> 
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </p>
                      </div>
                    <p className=" text-sm ">{msg.content}</p>
                    </div>
                    </div>
                  </div>
                    ))}
                  </div>
                ) : selectedRoom ? (
                  <div className='flex flex-col-reverse justify-end'>
                    <div className=''>
                    {messages.map((msg, index) => (
                      <div key={index}>
                        {index === 0 || getMessagePartition(messages[index].timestamp) !== getMessagePartition(messages[index - 1].timestamp) ? (
                          <div className='flex items-center justify-center'>
                          <span className='border-t w-full'></span>
                          <p className="inline-block text-nowrap text-xs rounded-md font-semibold text-center px-2 py-1 m-2">{getMessagePartition(msg.timestamp)}</p>
                          <span className='border-t w-full'></span>
                          </div>
                        ) : null}
                        <div className="flex-cols items-center justify-center flex py-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary text-secondary rounded-full mr-2">
                            <span className="text-xs font-semibold">{getInitials(msg.name)}</span>
                          </div>
                          <div className="w-full">
                            <div className="flex justify-between items-center">
                              <p className="text-xs font-semibold">{msg.name}</p>
                              <p className="text-xs">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </p>
                            </div>
                            <p className="text-sm ">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </ScrollArea>
            </ResizablePanel>
            {selectedUser || selectedRoom ? (
            <ResizablePanel defaultSize={10}>
              <ChatBox sendMessage={sendMessage} />
            </ResizablePanel>
            ) : (<></>)}
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default ChatPage;
