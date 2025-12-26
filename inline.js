
  // 手动选择目录并导出 JSON 备份（使用统一 Toast 提示）
  async function manualBackup() {
    if (!window.showDirectoryPicker) {
      showToast("当前浏览器不支持目录访问 API，建议使用最新版的 Edge/Chrome。", "warning");
      return;
    }
    if (!records || records.length === 0) {
      showToast("当前没有可备份的数据！", "warning");
      return;
    }

    try {
      const dir = await window.showDirectoryPicker();
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const fileName = `工单备份_${today}.json`;
      const fileHandle = await dir.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(records, null, 2));
      await writable.close();

      showToast("备份成功！", "success");
    } catch (e) {
      if (e && e.name === "AbortError") {
        // 用户取消选择，静默即可
        return;
      }
      console.error(e);
      showToast("备份失败！", "error");
    }
  }
