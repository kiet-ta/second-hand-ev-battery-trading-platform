import { Result, Button } from "antd";

function PaymentFailPage() {
    return(
        <div className="flex items-center justify-center w-screen h-screen bg-red-50">
      <Result
        status="error"
        title="Payment Failed"
        subTitle="The system is under maintenance. Please try later."
        extra={[
          <Button type="primary" key="home" href="/">
            Back To Homepage
          </Button>,
 
        ]}
      />
    </div>
    )
}
export default PaymentFailPage;
