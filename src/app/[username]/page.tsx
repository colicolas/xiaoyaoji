import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import type { Metadata } from "next";
import UserProfile from "@/components/UserProfile";

// 1. 定义数据接口 (注意 createdAt 改成了 number)
interface Post {
  id: string;
  content: string;
  type: 'kun' | 'peng';
  createdAt: number; // 👈 改成 number，解决序列化报错
  username: string;
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const decodedName = decodeURIComponent(username);
  return {
    title: `${decodedName} 的逍遥游`,
  };
}

async function getUserData(username: string) {
  try {
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef,
      where("username", "==", username),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    
    const posts = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        content: data.content,
        type: data.type,
        username: data.username,
        // 👇 关键修复：把对象转成数字，否则 Client Component 会报错
        createdAt: data.createdAt ? data.createdAt.toMillis() : 0, 
      };
    }) as Post[];

    return { posts };
  } catch (error) {
    console.error("Error fetching user data:", error);
    return { posts: [] };
  }
}

export default async function UserPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const decodedUsername = decodeURIComponent(username);
  const { posts } = await getUserData(decodedUsername);

  return (
    <div className="min-h-screen bg-gradient-xiaoyao w-full flex justify-center overflow-x-hidden">
      <UserProfile posts={posts} username={decodedUsername} />
    </div>
  );
}
