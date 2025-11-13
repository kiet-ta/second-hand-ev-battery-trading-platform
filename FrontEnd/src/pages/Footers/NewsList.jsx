import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Spin, Tag, Pagination, Empty } from "antd";
import { CalendarOutlined } from "@ant-design/icons";
import newsApi from "../../api/newsApi";

export default function NewsList() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 20;
  const navigate = useNavigate();

  const fetchNews = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await newsApi.getNews({ page: pageNum, pageSize });
      // ✅ Filter only approved news
      const approvedNews = res.filter((n) => n.status === "Approved");
      setNewsList(approvedNews);
      setTotal(res.length); // update if API returns total count
    } catch (err) {
      console.error("Failed to load news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(page);
  }, [page]);

  const handleClick = (news) => {
    navigate(`/news/${news.newsId}`, { state: news });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-800 flex items-center gap-2">
        📰 Tin Tức Mới Nhất
      </h1>

      {newsList.length === 0 ? (
        <Empty description="Không có tin tức được duyệt" />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {newsList.map((news) => (
            <Card
              key={news.newsId}
              hoverable
              className="shadow-md hover:shadow-2xl border border-slate-200 transition-all duration-300 transform hover:-translate-y-1 bg-white rounded-xl"
              onClick={() => handleClick(news)}
              bodyStyle={{ padding: "0" }}
            >
              <div className="flex">
                <div className="w-48 h-36 overflow-hidden rounded-l-xl">
                  <img
                    src={news.thumbnailUrl}
                    alt={news.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-4 flex flex-col justify-between flex-1">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 line-clamp-2 mb-1">
                      {news.title}
                    </h2>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {news.summary || "Không có mô tả"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3 text-gray-500 text-xs">
                    <span>
                      <CalendarOutlined className="mr-1" />
                      {new Date(news.publishDate).toLocaleDateString("vi-VN")}
                    </span>
                    <Tag color="green">{news.status?.toUpperCase()}</Tag>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-center mt-8">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          showSizeChanger={false}
          onChange={(p) => setPage(p)}
          className="text-center"
        />
      </div>
    </div>
  );
}
