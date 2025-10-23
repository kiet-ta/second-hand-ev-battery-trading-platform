import { Result, Button } from "antd";
function PaymentSuccessPage() {
  return (
    <div className="flex items-center justify-center w-screen h-screen bg-green-50">
      <Result
        status="success"
        title="Product Purchased Successfully!"
        subTitle="Thank you for using our service."
        extra={[
          <Button type="primary" key="home" href="/">
            Back To Homepage
          </Button>,
        ]}
      />
    </div>
  );
}
export default PaymentSuccessPage;
