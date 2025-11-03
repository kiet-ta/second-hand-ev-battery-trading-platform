export const getCompareList = () =>
    JSON.parse(localStorage.getItem("compareList") || "[]");

export const saveCompareList = (list) => {
    localStorage.setItem("compareList", JSON.stringify(list));
};

const emit = (event, detail = {}) =>
    window.dispatchEvent(new CustomEvent(event, { detail }));

export const addToCompare = (item) => {
    let list = getCompareList();

    if (list.length === 0) {
        const next = [item];
        saveCompareList(next);
        emit("compare:added", { count: 1, type: item.itemType });
        return true;
    }

    const currentType = list[0].itemType;
    if (item.itemType !== currentType) {
        emit("compare:error", {
            message: `Bạn chỉ có thể so sánh các sản phẩm cùng loại (${currentType.toUpperCase()}).`,
        });
        return false;
    }

    if (list.some((x) => x.itemId === item.itemId)) {
        emit("compare:error", { message: "Sản phẩm này đã có trong danh sách so sánh." });
        return false;
    }

    if (list.length >= 3) {
        emit("compare:error", { message: "Chỉ có thể so sánh tối đa 3 sản phẩm." });
        return false;
    }

    const next = [...list, item];
    saveCompareList(next);
    emit("compare:added", { count: next.length, type: currentType });
    return true;
};

export const removeFromCompare = (id) => {
    const next = getCompareList().filter((x) => x.itemId !== id);
    saveCompareList(next);
    emit("compare:removed", { count: next.length });
    return next;
};

export const clearCompare = () => {
    localStorage.removeItem("compareList");
    emit("compare:cleared");
};

export const openCompareModal = () => {
    window.dispatchEvent(new CustomEvent("compare:openModal"));
};
