import React, { useState } from "react";
import {
    Pencil,
    ClipboardList,
    Image as ImageIcon,
} from "lucide-react";
import NewsEditor from "../Editor/TextEditor";
function Card({ children, className = "" }) {
    return (
        <div className={`rounded-2xl shadow-sm border border-slate-200 bg-white ${className}`}>
            {children}
        </div>
    );
}

function CardHeader({ title, icon }) {
    return (
        <div className="flex items-center gap-3 p-5 border-b border-slate-100">
            {icon}
            <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
    );
}

// --------------------------------------------------------

export default function NewsPage() {
    const [newsList, setNewsList] = useState([
        { 
            id: 1, 
            title: "Welcome to the News Management!",
            category: "EV News",
            summary: "The image uploader is now a separate, reusable component.",
            authorId: 1,
            thumbnailUrl: "https://placehold.co/600x400/31343C/FFFFFF?text=Example",
            content: "<p>The image uploader is now a separate, reusable component.</p>",
            tags: "ev,battery,trading",
        },
    ]);

    const [newPost, setNewPost] = useState({
        title: "",
        category: "EV News",
        summary: "",
        authorId: 1,
        thumbnailUrl: "",
        content: "",
        tags: "ev,battery,trading",
    });

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("--- New Post Data ---");
        console.log(JSON.stringify(newPost, null, 2));

        if (!newPost.title || !newPost.content) {
            alert("Please fill in the title and content fields.");
            return;
        }

        const apiPayload = {
            title: newPost.title,
            category: newPost.category,
            summary: newPost.summary || newPost.content.substring(0, 200),
            authorId: newPost.authorId,
            thumbnailUrl: newPost.thumbnailUrl,
            content: newPost.content,
            tags: newPost.tags,
        };

        console.log("--- API Payload to Backend ---");
        console.log(JSON.stringify(apiPayload, null, 2));

        const newPostData = { id: Date.now(), ...apiPayload };
        setNewsList((prev) => [newPostData, ...prev]);

        setNewPost({
            title: "",
            category: "EV News",
            summary: "",
            authorId: 1,
            thumbnailUrl: "",
            content: "",
            tags: "ev,battery,trading",
        });
    };

    return (
        <div className="space-y-6">
            {/* --- Create News --- */}
            <Card>
                <CardHeader title="Create News Post" icon={<Pencil size={18} />} />

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Unified news editor */}
                    <NewsEditor
                        initialData={newPost}
                        onDataChange={(data) => setNewPost(data)}
                    />

                    <button
                        type="submit"
                        className="px-4 py-2 text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                    >
                        Post News
                    </button>
                </form>
            </Card>

            {/* --- Published News List --- */}
            <Card>
                <CardHeader title="Published News" icon={<ClipboardList size={18} />} />
                <div className="p-5 space-y-4">
                    {newsList.map((post) => (
                        <article
                            key={post.id}
                            className="flex items-start gap-4 p-4 border rounded-lg border-slate-200"
                        >
                            {post.thumbnailUrl ? (
                                <img
                                    src={post.thumbnailUrl}
                                    alt="Thumbnail"
                                    className="w-32 h-20 object-cover rounded-md flex-shrink-0"
                                />
                            ) : (
                                <div className="w-32 h-20 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0">
                                    <ImageIcon className="text-slate-400" size={24} />
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-800">
                                    {post.title}
                                </h3>
                                <p className="text-xs text-slate-500 mb-1">{post.category}</p>
                                <div
                                    className="prose prose-sm max-w-none text-slate-600"
                                    dangerouslySetInnerHTML={{ __html: post.content }}
                                />
                            </div>
                        </article>
                    ))}
                </div>
            </Card>
        </div>
    );
}
