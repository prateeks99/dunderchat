"use client";
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from "@/components/ui/button";

type Props = {
    sendMessage: (message: string) => void;
};

export function ChatBox({ sendMessage }: Props) {
    const [message, setMessage] = useState<string>('');

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (message.trim() !== '') {
            sendMessage(message);
            setMessage('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="h-10 flex w-full px-6 pb-6">
            <Input placeholder="Type your message here." className="mr-4" value={message} onChange={handleChange}/>
            <Button type="submit" >Send</Button>
        </form>
    );
}
