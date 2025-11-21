import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Spin, Avatar } from "antd";
import { ArrowLeftOutlined, CalendarOutlined, UserOutlined } from "@ant-design/icons";
import newsApi from "../../api/newsApi";
import userApi from "../../api/userApi";
import { Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import newsPlaceholder from "../../assets/images/news_placeholder.png"

export default function NewsDetail() {
  const { newsId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [news, setNews] = useState(location.state || null);
  const [author, setAuthor] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    const load = async () => {
      try {
        let article = location.state;
        if (!article) {
          const fetched = await newsApi.getNewsById(newsId);
          article = fetched;
          setNews(fetched);
        }
        if (article?.authorId) {
          const authorInfo = await userApi.getUserByID(article.authorId);
          setAuthor(authorInfo);
        }
        const all = await newsApi.getNews();
        setRelated(all.filter((n) => n.newsId !== article.newsId).slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [newsId]);

  if (loading || !news)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="bg-[#FAF8F3] min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-5 space-y-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-[#B8860B] hover:text-[#8B6A02] font-medium"
        >
          <ArrowLeftOutlined className="mr-2" /> Quay lại
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl border-2 border-[#C4B5A0]/50 shadow-lg overflow-hidden">
          {news.thumbnailUrl && (
            <img
              src={news.thumbnailUrl || newsPlaceholder}
              alt={news.title}
              className="w-full h-96 object-cover"
            />
          )}
          <div className="p-8">
            <h1 className="text-4xl font-roboto font-extrabold text-[#2C2C2C] mb-4">
              {news.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm mb-6">
              <CalendarOutlined />
              <span>{new Date(news.publishDate).toLocaleDateString("vi-VN")}</span>
              <span className="bg-[#F8F5E9] text-[#B8860B] px-3 py-1 rounded-full font-semibold">
                {news.category}
              </span>
            </div>

            <div
              className="prose prose-lg text-gray-700 max-w-none"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          </div>
        </div>

        {/* Author Info */}
        {author && (
          <div className="flex items-center gap-5 p-6 bg-white rounded-2xl shadow-md border-2 border-[#C4B5A0]/50">
            <Avatar size={80} src={author.avatarProfile} icon={<UserOutlined />} />
            <div>
              <h3 className="font-roboto text-2xl text-[#2C2C2C] font-semibold">
                {author.fullName}
              </h3>
              <p className="text-gray-600">{author.bio}</p>
              <p className="text-gray-400 text-sm mt-1">
                {translateKey(author.gender)} • {author.phone}
              </p>
            </div>
          </div>
        )}

        {/* Related News */}
        {related.length > 0 && (
          <div>
            <h2 className="text-3xl font-roboto font-bold text-[#2C2C2C] mb-6 flex items-center gap-2">
              <Newspaper className="text-[#B8860B]" /> Tin Liên Quan
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((n) => (
                <Link
                  key={n.newsId}
                  to={`/news/${n.newsId}`}
                  state={n}
                  className="bg-white border-2 border-[#C4B5A0]/40 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <img
                    src={n.thumbnailUrl}
                    alt={n.title}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-roboto text-xl text-[#2C2C2C] font-semibold mb-2 line-clamp-2">
                      {n.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-3">{n.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function translateKey(key) {
  const dict = {
    Female: "Nữ",
    Male: "Nam",
  };
  return dict[key] || key;
}

