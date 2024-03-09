"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardFooter,
    CardTitle
} from '@/components/ui/card';
import { 
    Tabs,
    TabsList,
    TabsContent,
    TabsTrigger
} from '@/components/ui/tabs';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { io, Socket } from 'socket.io-client';
import { SiteHeader } from '@/components/site-header';

const formSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string(),
})

type UserData = {
  // user data structure
};

const LoginPage: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null); 
  const [loading, setLoading] = useState<boolean>(true); 
  const router = useRouter();

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
          router.push('/chat');
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [loading, router]);

  const handleLogin = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth', {
        method: 'POST',
        credentials: 'include',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
      })
      if (!response.ok) {
        throw new Error('Bad Response');
      }
      console.log("Log in Successful.");
      setLoading(true);
      router.push('/chat');
    } catch(error) {
      console.error('Error logging in:', error);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    handleLogin(values);
  };

  const handleDiscordLoginClick = () => {
    window.location.href = 'http://localhost:5000/api/auth/github';
  };

  return (
    <div>
      <SiteHeader />
      <div className='container grid grid-cols-1 items-center pb-8 pt-6 md:py-10 md:grid-cols-2 lg:py-10 lg:grid-cols-3'>
      <section className="container grid items-center md:col-span-1 lg:col-span-2 gap-6 pb-8 pt-6 md:py-10">
        <div className="flex max-w-[980px] flex-col items-start gap-2">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
            DunderChat
          </h1>
          <p className="max-w-[750px] text-lg text-muted-foreground">
            Real-time chat app using Express, Socket.IO, Next.js, with MongoDB for data storage.
          </p>
        </div>
        <div className="flex gap-4">
          <Link href={siteConfig.links.docs} target="_blank" rel="noreferrer" className={buttonVariants()}>
            Documentation
          </Link>
          <Link
            target="_blank"
            rel="noreferrer"
            href={siteConfig.links.github}
            className={buttonVariants({ variant: "outline" })}
          >
            GitHub
          </Link>
        </div>
      </section>
      <section className='container grid items-center col-span-1 gap-6 pb-8 pt-6 md:py-10'>
        <Tabs defaultValue="login" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className='font-extrabold'>Login</CardTitle>
                <CardDescription>
                  Welcome Back! Please log into your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="mb-2">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem className='mb-2'>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem className='mb-4'>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className='w-full'>Sign in</Button>
                  </form>
                </Form>
                <Button onClick={handleDiscordLoginClick} className='w-full bg-primary'>
                  Sign in with Github
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle className='font-extrabold'>Register</CardTitle>
                <CardDescription>
                  Enter your details to register.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="space-y-1">
                  <Label htmlFor="displayName">Full Name</Label>
                  <Input id="displayName" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="new">Password</Label>
                  <Input id="new" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Register</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
      </div>
    </div>
  );
};

export default LoginPage;
