import React, { useState } from "react";
import ImageUploader from '../ImageUploader'; 
import TextEditor from "../Editor/TextEditor"; 
import {
    Pencil,
    ClipboardList,
    Image as ImageIcon,
} from "lucide-react";

// --- Reusable Card Components (omitted for brevity) ---
function Card({ children, className = "" }) {
    return (<div className={`rounded-2xl shadow-sm border border-slate-200 bg-white ${className}`}>{children}</div>);
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
            title: 'Welcome to the News Management!', 
            content: 'The image uploader is now a separate, reusable component.',
            thumbnailUrl: 'https://placehold.co/600x400/31343C/FFFFFF?text=Example',
        },
    ]);
    
    const [newPost, setNewPost] = useState({ title: '', content: '' }); 
    const [thumbnailUrl, setThumbnailUrl] = useState(''); 

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNewPost(prev => ({ ...prev, [name]: value }));
    };

    const handleContentChange = (htmlContent) => {
        setNewPost(prev => ({ ...prev, content: htmlContent }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!newPost.title || !newPost.content) {
            alert('Please fill in the title and content fields.');
            return;
        }

        const apiPayload = {
            title: newPost.title,
            category: "EV News", 
            summary: newPost.content.substring(0, 200), 
            author_id: 1, 
            thumbnail_url: thumbnailUrl, 
            content: newPost.content, 
            tags: "ev, battery, trading", 
        };

        console.log("--- API Payload to Backend ---");
        console.log(JSON.stringify(apiPayload, null, 2));

        const newPostData = {
            id: Date.now(),
            title: newPost.title,
            content: newPost.content,
            thumbnailUrl: thumbnailUrl,
        };

        setNewsList(prev => [newPostData, ...prev]);

        // Reset form fields, which triggers TextEditor's useEffect to clear content
        setNewPost({ title: '', content: '' });
        setThumbnailUrl('');
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader title="Create News Post" icon={<Pencil size={18} />} />
                <form onSubmit={handleSubmit} className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    <div className="md:col-span-2 space-y-4">
                        <input
                            type="text" name="title" placeholder="News Title"
                            value={newPost.title} onChange={handleInputChange}
                            className="w-full p-2 border rounded-lg border-slate-300"
                        />
                        
                        {/* Only one TextEditor instance, using the Strict Mode fix */}
                        <TextEditor 
                            onContentChange={handleContentChange} 
                            initialContent={newPost.content}
                        />
                        
                        <button 
                            type="submit" 
                            className="px-4 py-2 text-white bg-slate-900 rounded-lg hover:bg-slate-800"
                        >
                             Post News
                        </button>
                    </div>
                    
                    <div>
                        <ImageUploader 
                            onUploadSuccess={(url) => {
                                setThumbnailUrl(url);
                            }}
                        />
                    </div>
                </form>
            </Card>

            <Card>
                <CardHeader title="Published News" icon={<ClipboardList size={18} />} />
                <div className="p-5 space-y-4">
                    {newsList.map((post) => (
                        <article key={post.id} className="flex items-start gap-4 p-4 border rounded-lg border-slate-200">
                           {post.thumbnailUrl ? (
                                <img src={post.thumbnailUrl} alt="Thumbnail" className="w-32 h-20 object-cover rounded-md flex-shrink-0" />
                           ) : (
                                <div className="w-32 h-20 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0">
                                    <ImageIcon className="text-slate-400" size={24} />
                                </div>
                           )}
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-800">{post.title}</h3>
                                <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: post.content }} />
                            </div>
                        </article>
                    ))}
                </div>
            </Card>
        </div>
    );
}