import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Button,
  Spin,
  Tag,
  message,
  Input,
  Space,
  Modal,
} from "antd";
import { Check, XCircle, Search, ClipboardList } from "lucide-react";
import { motion } from "framer-motion";
import { managerAPI } from "../../hooks/managerApi";
import kycApi from "../../api/kycApi";
import Card from "../../components/Manager/Card";
import CardHeader from "../../components/Manager/CardHeader";

const KycDocumentCard = ({ document, onApprove, onReject }) => {
  const [note, setNote] = useState("");
  return (
    <div className="border p-3 rounded-md shadow-sm">
      <p><b>Loại:</b> {document.type}</p>
      <p><b>Ngày tải lên:</b> {new Date(document.submittedAt).toLocaleDateString("vi-VN")}</p>
      <p>
        <b>Trạng thái:</b> 
        <Tag color={
          document.status === "pending" ? "orange" : 
          document.status === "approved" ? "green" : "red"
        }>
          {document.status === "pending" ? "Chờ duyệt" : document.status === "approved" ? "Đã duyệt" : "Từ chối"}
        </Tag>
      </p>
      <textarea
        placeholder="Ghi chú..."
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="border rounded w-full mt-2 p-1"
      />
      <div className="flex gap-2 mt-2">
        <Button type="primary" onClick={() => onApprove(document.docId, note)}>Duyệt</Button>
        <Button danger onClick={() => onReject(document.docId, note)}>Từ chối</Button>
      </div>
    </div>
  );
};

export default function SellerApprovalContent() {
  const [approvals, setApprovals] = useState([]);
  const [filteredApprovals, setFilteredApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [kycTab, setKycTab] = useState("pending");
  const [kycDocs, setKycDocs] = useState([]);
  const [kycLoading, setKycLoading] = useState(false);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const data = await managerAPI.getPendingSellerApprovals();
      setApprovals(data || []);
    } catch (err) {
      console.error("❌ Lỗi tải danh sách người bán:", err);
      message.error("Không thể tải danh sách chờ duyệt.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApprovals(); }, []);

  useEffect(() => {
    let result = [...approvals];
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(a => a.seller.toLowerCase().includes(q));
    }
    setFilteredApprovals(result);
  }, [approvals, searchQuery]);

  const handleAction = async (id, action) => {
    try {
      if (action === "approve") {
        await managerAPI.approveSeller(id);
        message.success("✅ Đã duyệt người bán thành công.");
      } else {
        await managerAPI.rejectSeller(id);
        message.info("🚫 Đã từ chối người bán.");
      }
      await fetchApprovals();
    } catch (err) {
      console.error(err);
      message.error("❌ Xử lý thất bại, vui lòng thử lại.");
    }
  };

  const fetchKycDocuments = useCallback(async (userId) => {
    setKycLoading(true);
    try {
      let response;
      if (kycTab === "pending") response = await kycApi.getPendingKYC(userId);
      if (kycTab === "approved") response = await kycApi.getApprovedKYC(userId);
      if (kycTab === "rejected") response = await kycApi.getRejectedKYC(userId);
      setKycDocs(response || []);
    } catch (err) {
      console.error("Lỗi khi tải KYC:", err);
      message.error("Không thể tải KYC.");
    } finally {
      setKycLoading(false);
    }
  }, [kycTab]);

  const openKycModal = (seller) => {
    setSelectedSeller(seller);
    setModalVisible(true);
    fetchKycDocuments(seller.userId);
  };

  const handleApproveKyc = async (docId, note) => {
    try {
      await kycApi.putApprovedKYC(docId, {
        note: note || "Tài liệu hợp lệ",
        verifiedAt: new Date().toISOString(),
        verifiedBy: localStorage.getItem("userId")
      });
      message.success("✅ Đã duyệt KYC.");
      fetchKycDocuments(selectedSeller.userId);
    } catch (err) {
      console.error(err);
      message.error("❌ Lỗi khi duyệt KYC.");
    }
  };

  const handleRejectKyc = async (docId, note) => {
    if (!note?.trim()) {
      message.warning("Vui lòng nhập lý do từ chối.");
      return;
    }
    try {
      await kycApi.putRejectedKYC(docId, {
        note,
        verifiedAt: new Date().toISOString(),
        verifiedBy: localStorage.getItem("userId")
      });
      message.info("🚫 Đã từ chối KYC.");
      fetchKycDocuments(selectedSeller.userId);
    } catch (err) {
      console.error(err);
      message.error("❌ Lỗi khi từ chối KYC.");
    }
  };

  const columns = [
    { title: "Mã", dataIndex: "id", key: "id", align: "center", width: 80 },
    { title: "Tên người bán", dataIndex: "seller", key: "seller" },
    { title: "Khu vực", dataIndex: "region", key: "region" },
    {
      title: "Ngày gửi yêu cầu",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }),
    },
    {
      title: "Trạng thái",
      key: "status",
      align: "center",
      render: () => <Tag color="orange">Đang chờ duyệt</Tag>,
    },
    {
      title: "Hành động",
      key: "actions",
      align: "center",
      render: (_, record) => (
        <Space>
          <Button type="primary" icon={<Check />} onClick={() => handleAction(record.id, "approve")}>Duyệt</Button>
          <Button danger icon={<XCircle />} onClick={() => handleAction(record.id, "reject")}>Từ chối</Button>
          <Button icon={<ClipboardList />} onClick={() => openKycModal(record)}>Xem KYC</Button>
        </Space>
      ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
      <Card>
        <CardHeader title="Danh sách người bán chờ phê duyệt" icon={<ClipboardList size={18} />} />

        <div className="p-4">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <Space wrap>
              <Input
                prefix={<Search size={16} className="text-slate-400" />}
                placeholder="Tìm theo tên người bán..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                style={{ width: 260 }}
              />
            </Space>
          </div>

          <div className="text-sm text-slate-600 mb-3">
            Hiển thị <b>{filteredApprovals.length}</b> yêu cầu chờ duyệt
            {searchQuery && `, kết quả tìm kiếm: “${searchQuery}”`}
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-[50vh]"><Spin size="large" /></div>
          ) : (
            <Table rowKey="id" columns={columns} dataSource={filteredApprovals} bordered pagination={{ pageSize: 10 }} scroll={{ x: true }} />
          )}
        </div>
      </Card>

      <Modal
        title={`KYC của ${selectedSeller?.seller || ""}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <div className="mb-4 flex gap-3">
          {["pending","approved","rejected"].map(tab => (
            <Button
              key={tab}
              type={kycTab===tab ? "primary":"default"}
              onClick={() => { setKycTab(tab); fetchKycDocuments(selectedSeller.userId); }}
            >
              {tab === "pending" ? "Chờ duyệt" : tab === "approved" ? "Đã duyệt" : "Từ chối"}
            </Button>
          ))}
        </div>
        {kycLoading ? <Spin /> : (
          kycDocs.length === 0 ? <p>Không có tài liệu.</p> :
          <div className="grid grid-cols-1 gap-4">
            {kycDocs.map(doc => (
              <KycDocumentCard key={doc.docId} document={doc} onApprove={handleApproveKyc} onReject={handleRejectKyc} />
            ))}
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
