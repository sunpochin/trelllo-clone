/**
 * 🎮 useListMenu = 列表選單遙控器 (列表選單專用 Composable)
 * 
 * 🎯 這個檔案負責什麼？
 * - 封裝列表選單的開關狀態管理
 * - 提供選單操作的統一介面
 * - 實現依賴反轉，讓組件不直接依賴 boardStore
 * - 遵循單一職責原則，專門處理選單相關邏輯
 * 
 * 🤔 想像你有一個選單遙控器：
 * 
 * ❌ 沒有遙控器的世界：
 * - 組件要直接伸手進 boardStore 機器裡控制選單
 * - 每個組件都要知道機器內部結構
 * - 機器改了，所有組件都要修理
 * 
 * ✅ 有遙控器的世界：
 * - 按「開啟選單」按鈕就能開啟
 * - 按「關閉選單」按鈕就能關閉
 * - 組件不用知道機器怎麼運作，按按鈕就對了
 * 
 * 📋 主要功能：
 * 1. openMenuId - 取得目前開啟的選單 ID
 * 2. toggleMenu() - 切換指定選單的開關狀態
 * 3. closeAllMenus() - 關閉所有選單
 * 
 * 🔄 架構模式：
 * ListMenu → useListMenu → boardStore
 * (UI層)  →  (業務邏輯層) → (資料層)
 * 
 * 💡 設計原則應用：
 * - D (Dependency Inversion): 組件依賴抽象，不依賴具體實作
 * - S (Single Responsibility): 只負責選單狀態管理
 * - O (Open/Closed): 對擴展開放，對修改封閉
 * 
 * 🎯 這個檔案就是「選單操作的遙控器」：
 * - 組件想知道選單開著嗎？看 openMenuId
 * - 組件想開關選單？按 toggleMenu() 按鈕
 * - 組件想關閉所有選單？按 closeAllMenus() 按鈕
 * - 底層怎麼存放資料？組件不用知道
 */

import { storeToRefs } from 'pinia'
import { useBoardStore } from '@/stores/boardStore'

// 封裝列表選單的開關狀態與操作，避免元件直接依賴 boardStore（依賴反轉）
export const useListMenu = () => {
  const store = useBoardStore()
  
  // 🔗 使用 storeToRefs 讓 reactive 資料保持響應性
  // 這樣組件就能自動響應選單狀態的變化
  const { openMenuId } = storeToRefs(store)
  
  // 切換指定選單的開啟狀態
  // 如果該選單已開啟則關閉，如果其他選單開啟則切換到該選單
  const toggleMenu = (listId: string) => {
    console.log('🎮 [COMPOSABLE] toggleMenu 被呼叫，列表ID:', listId)
    store.toggleMenu(listId)
  }
  
  // 關閉所有選單
  // 通常在點擊外部區域或執行操作後呼叫
  const closeAllMenus = () => {
    console.log('🎮 [COMPOSABLE] closeAllMenus 被呼叫')
    store.closeAllMenus()
  }
  
  // 回傳統一的介面，讓組件只需要知道這些方法
  return { 
    openMenuId,    // 響應式的開啟選單 ID
    toggleMenu,    // 切換選單方法
    closeAllMenus  // 關閉所有選單方法
  }
}