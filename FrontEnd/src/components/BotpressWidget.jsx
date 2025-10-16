import { useEffect } from "react";

export default function BotpressWidget() {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdn.botpress.cloud/webchat/v1/inject.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
            window.botpressWebChat.init({
                botId: "4e14995b-5a75-4ef4-8b9b-ecd1ac550bc1", // thay bằng botId của bạn
                clientId: "4e14995b-5a75-4ef4-8b9b-ecd1ac550bc1", // copy trong đoạn script ở tab Share
                hostUrl: "https://cdn.botpress.cloud/webchat/v1",
                messagingUrl: "https://messaging.botpress.cloud",
                botName: "MeoMeo",
                composerPlaceholder: "Nhập tin nhắn...",
                themeName: "prism",
                showPoweredBy: false,
            });
        };
    }, []);

    return null;
}
