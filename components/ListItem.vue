<!--
  📋 ListItem 組件 - 看板列表組件 (Trello Clone 核心組件之一)
  
  🎯 組件主要功能：
  ✅ 渲染單一看板列表及其所有卡片
  ✅ 支援列表標題的即時編輯功能 (點擊標題可編輯，按 Enter 儲存，按 Esc 取消)
  ✅ 管理卡片的拖拽排序功能 (同列表內移動 + 跨列表移動)
  ✅ 提供列表操作選單 (新增卡片、刪除列表)
  ✅ 處理卡片的新增和開啟編輯功能
  ✅ 整合事件通訊系統，將操作傳遞給父組件
  
  🔧 使用的技術棧：
  - Vue 3 Composition API
  - VueDraggableNext (拖拽功能)
  - 自訂 useListActions composable (業務邏輯抽象層)
  - TypeScript 型別安全
  - Tailwind CSS 樣式
  
  📦 Props 參數：
  - list: ListUI - 列表資料物件，包含 id、title、position、cards 等欄位
  
  🚀 Emit 事件：
  - card-move: 當卡片被拖拽移動時觸發，傳遞拖拽事件資料給父組件處理
  - open-card-modal: 當點擊卡片要開啟編輯模態框時觸發，傳遞卡片資料給父組件
  
  🏗️ 子組件結構：
  - Card.vue: 渲染單一卡片，處理卡片顯示和點擊事件
  - ListMenu.vue: 渲染三點選單，提供列表操作功能 (新增卡片、刪除列表)
  
  💡 核心交互邏輯：
  1. 列表標題編輯：點擊標題 → 變成輸入框 → Enter 儲存 / Esc 取消 / 失焦儲存
  2. 卡片拖拽移動：使用 VueDraggableNext，支援同列表排序和跨列表移動
  3. 新增卡片：點擊底部按鈕或選單項目 → 呼叫 useListActions.addCard()
  4. 刪除列表：通過選單 → 呼叫 useListActions.deleteList()
  5. 開啟卡片編輯：點擊卡片 → emit 事件給父組件開啟模態框
  
  🎯 SOLID 原則設計說明：
  
  ✅ S (Single Responsibility) - 單一職責原則
     只負責「單個列表」的渲染和基本互動，不處理整體看板邏輯
     標題編輯、卡片管理、選單操作各自獨立，職責清晰分離
     
  ✅ O (Open/Closed) - 開放封閉原則
     要新增列表功能時，透過 emit 事件和 useListActions 擴展
     不需要修改此組件的核心邏輯，符合對擴展開放、對修改封閉
     
  ✅ L (Liskov Substitution) - 里氏替換原則
     組件接受 ListUI 型別，任何符合此介面的列表物件都可以正常運作
     不會因為列表資料的細微差異而導致組件功能異常
     
  ✅ I (Interface Segregation) - 介面隔離原則
     只依賴所需的 props 和 emit 事件，不強迫使用者實作不需要的介面
     useListActions 只暴露此組件實際需要的方法
     
  ✅ D (Dependency Inversion) - 依賴反轉原則  
     不直接依賴 boardStore，而是透過 useListActions 抽象層
     組件依賴抽象介面，不依賴具體實作，提升可測試性和維護性
     
  📝 擴展方式：
     - 新增列表操作：在 useListActions 加函數，此組件自動可用
     - 新增 UI 元素：在 ListMenu 組件加按鈕，此組件接收 emit 事件
     - 新增卡片功能：修改 Card 組件，此組件自動繼承新功能
     - 修改拖拽行為：調整 draggable 組件的設定，不影響其他邏輯
  
  🧪 測試覆蓋：
     組件已有完整的單元測試覆蓋，包含拖拽功能、事件處理、編輯功能等
     測試文件：tests/unit/components/CardDragDrop.test.ts (包含 ListItem 測試)
  
  📊 效能考量：
     - 使用 Vue 3 響應式系統，只在必要時重新渲染
     - 拖拽功能使用虛擬 DOM 最佳化，支援大量卡片的順暢移動
     - 事件處理使用 event.stopPropagation() 避免不必要的事件冒泡
  
  🔄 狀態管理：
     - 本地狀態：列表標題編輯狀態 (isEditingTitle, editingTitle)
     - 全域狀態：透過 useListActions 與 boardStore 互動
     - 響應式更新：當 boardStore 資料變更時，組件自動重新渲染
-->

<template>
  <!-- 單個列表容器 -->
  <div 
    :class="[
      'bg-gray-200 rounded p-2 flex-shrink-0 flex flex-col',
      props.isMobile ? 'mobile-list-item' : 'w-80'
    ]" 
    :data-list-id="list.id"
  >
    <!-- 列表標題區域 -->
    <div class="cursor-pointer flex justify-between items-center p-2 mb-2 relative">
      <!-- 非編輯狀態：顯示標題 -->
      <h2 
        v-if="!isEditingTitle" 
        class="w-full text-base font-bold select-none cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
        @click="startEditTitle"
      >
        {{ list.title }}
      </h2>
      
      <!-- 編輯狀態：顯示輸入框 -->
      <input
        v-else
        ref="titleInput"
        v-model="editingTitle"
        class="w-full text-base font-bold bg-white border-2 border-blue-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all"
        @keydown.enter="saveTitle"
        @blur="saveTitle"
        @keydown.esc="cancelEdit"
      />
      
      <!-- 列表選單組件 -->
      <ListMenu 
        :list-id="list.id"
        @add-card="handleAddCard"
        @delete-list="handleDeleteList"
      />
    </div>
    
    <!-- 🤖 AI 生成任務按鈕 -->
    <div class="px-2 mb-3">
      <button
        @click="handleAiGenerate"
        :class="[
          'w-full px-3 py-2 text-sm text-white rounded-lg flex items-center justify-center gap-2 shadow-md transition-all duration-200',
          isAiGenerating 
            ? 'ai-rainbow-magic cursor-wait' 
            : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 hover:shadow-lg'
        ]"
        :disabled="isAiGenerating"
      >
        <svg 
          :class="[
            'w-4 h-4',
            isAiGenerating ? 'animate-spin' : ''
          ]" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
        </svg>
        <span>
          {{ isAiGenerating ? '🌈 生成中...' : '🤖 AI 生成任務' }}
        </span>
      </button>
    </div>
    
    <!-- 可拖拉的卡片容器 -->
    <div class="flex-1 overflow-y-auto">
      <!-- 📱 Vue Draggable Next 卡片拖拽系統 -->
      <!-- 💡 十歲小朋友解釋：這是讓卡片可以拖來拖去的魔法積木！ -->
      <!-- 🖱️ 只有「觸控」才需要延遲，滑鼠不用等 -->
      <!-- 💡 因為滑鼠很精準，手指容易誤觸 -->
      <!-- 📏 觸控敏感度：手指至少要移動 10 像素才算拖拽 -->
      <!-- 💡 十歲小朋友解釋：避免手指輕微抖動就開始拖拽，要移動一點點才算數 -->
      <!-- 🔄 交換門檻：拖拽多少比例才會交換位置 -->
      <!-- 💡 不會拖一點點就亂跳位置 -->
      <!-- 🫧 氣泡滾動：允許滾動事件向上傳遞 -->
      <!-- 💡 讓滾動可以穿透到父元素 -->
      <!-- 🚫 不阻止過濾事件：允許其他操作 -->
      <!-- 🎨 樣式類別：不同狀態的卡片長什麼樣子 -->
      <!-- 🎭 拖拽中的卡片樣式 (正在被拖拽的卡片) -->
      <!-- 💡 十歲小朋友解釋：正在拖拽的卡片會變成什麼樣子 -->
      <!-- 👻 幽靈卡片樣式 (原來位置的占位符) -->
      <!-- 💡 十歲小朋友解釋：原來的位置會留一個「影子」告訴你這裡空了 -->
      <!-- ✨ 被選中的卡片樣式 (長按選中時) -->
      <!-- 💡 十歲小朋友解釋：卡片被「點名」時會發光 -->
      <draggable
        class="min-h-5"
        :list="list.cards"
        group="cards"
        tag="div"
        :disabled="false"
        :force-fallback="props.isMobile"
        :fallback-on-body="true"
        :fallback-tolerance="0"
        :delay="props.isMobile ? 750 : 0"
        :delay-on-touch-only="props.isMobile"
        :touch-start-threshold="props.isMobile ? 10 : 0"
        :animation="200"
        :easing="'cubic-bezier(0.25, 0.46, 0.45, 0.94)'"
        :scroll-sensitivity="30"
        :swap-threshold="0.65"
        :bubble-scroll="true"
        :prevent-on-filter="false"
        :drag-class="props.isMobile ? 'mobile-drag' : 'desktop-drag'"
        :ghost-class="props.isMobile ? 'mobile-ghost' : 'desktop-ghost'"
        :chosen-class="props.isMobile ? 'mobile-chosen' : 'desktop-chosen'"
        @change="$emit('card-move', $event)"
      >
        <div v-for="card in list.cards" :key="card.id">
          <Card 
            :card="card" 
            :dragging="dragging"
            :is-mobile="props.isMobile"
            @open-modal="$emit('open-card-modal', card)"
            @delete="$emit('card-delete', card)"
            @update-title="(cardId, newTitle) => $emit('card-update-title', cardId, newTitle)"
          />
        </div>
      </draggable>
    </div>
    
    <!-- 新增卡片區域 -->
    <div class="mt-2">
      <!-- 顯示按鈕模式 -->
      <button 
        v-if="!isAddingCard"
        class="w-full p-3 bg-transparent border-2 border-dashed border-gray-300 rounded text-gray-600 cursor-pointer text-sm transition-all duration-200 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-800" 
        @click="startAddCard"
      >
        + 新增卡片
      </button>
      
      <!-- 顯示 inline 編輯模式 -->
      <div 
        v-else
        class="bg-white rounded px-3 py-3 shadow-sm border"
      >
        <textarea
          ref="newCardInput"
          v-model="newCardTitle"
          placeholder="輸入這張卡片的標題..."
          class="w-full resize-none border-none outline-none text-sm min-h-14"
          @keydown.enter.prevent="saveNewCard"
          @keydown.escape="cancelAddCard"
        />
        <div class="flex gap-2 mt-2">
          <button
            @click="saveNewCard"
            :disabled="!newCardTitle.trim()"
            class="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            新增卡片
          </button>
          <button
            @click="cancelAddCard"
            class="px-3 py-1 text-gray-600 text-sm rounded hover:bg-gray-100"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Card from '@/components/Card.vue'
import ListMenu from '@/components/ListMenu.vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'
// 🎯 純渲染組件：不直接使用 composables
import { ref, nextTick, computed } from 'vue'
import { useBoardStore } from '@/stores/boardStore'

// 使用統一的型別定義
import type { ListUI } from '@/types'
type List = ListUI

// 🎯 純渲染組件：接收父組件傳入的資料和狀態
const props = defineProps<{
  list: List
  dragging: boolean  // 父組件控制的拖拽狀態
  isMobile?: boolean  // 是否為手機版
  aiGeneratingListId?: string | null  // 正在生成 AI 任務的列表 ID
}>()

// 🎯 純渲染組件：定義事件 (父組件處理邏輯)
const emit = defineEmits<{
  'card-move': [event: any]
  'open-card-modal': [card: any]
  'drag-start': [item: any, type: 'card' | 'list']
  'drag-end': []
  'card-delete': [card: any]
  'card-update-title': [cardId: string, newTitle: string]
  'list-add-card': [listId: string, title: string]
  'list-delete': [listId: string]
  'list-update-title': [listId: string, newTitle: string]
  'ai-generate': [listId: string]
}>()

// 🎯 純渲染組件：移除直接 composable 使用

// 🌈 檢查這個特定列表是否正在生成 AI 任務
const isAiGenerating = computed(() => 
  props.aiGeneratingListId === props.list.id
)

// 編輯狀態
const isEditingTitle = ref(false)
const editingTitle = ref('')
const titleInput = ref<HTMLInputElement | null>(null)

// 新增卡片狀態
const isAddingCard = ref(false)
const newCardTitle = ref('')
const newCardInput = ref<HTMLTextAreaElement | null>(null)

// 🎯 純渲染：處理新增卡片 (委派給父組件)
const handleAddCard = () => {
  console.log('📌 [PURE-LIST] 新增卡片事件，委派給父組件')
  // 使用 inline 新增模式
  startAddCard()
}

// 開始 inline 新增卡片
const startAddCard = async () => {
  isAddingCard.value = true
  newCardTitle.value = ''
  
  // 等待 DOM 更新後聚焦到輸入框
  await nextTick()
  if (newCardInput.value) {
    newCardInput.value.focus()
  }
}

// 新增狀態管理：防止重複提交
const isSavingCard = ref(false)

// 🎯 純渲染：保存新卡片 (委派給父組件)
const saveNewCard = async () => {
  if (isSavingCard.value) return
  
  const titleToSave = newCardTitle.value.trim()
  if (!titleToSave) return
  
  isSavingCard.value = true
  
  try {
    // 委派給父組件處理業務邏輯
    emit('list-add-card', props.list.id, titleToSave)
    
    // UI 更新
    isAddingCard.value = false
    newCardTitle.value = ''
    console.log(`📌 [PURE-LIST] 新增卡片事件已發送: ${titleToSave}`)
    
  } catch (error) {
    console.error('❌ [PURE-LIST] 發送新增卡片事件失敗:', error)
  } finally {
    isSavingCard.value = false
  }
}

// 取消新增卡片
const cancelAddCard = () => {
  isAddingCard.value = false
  newCardTitle.value = ''
}

// 🎯 純渲染：處理刪除列表 (委派給父組件)
const handleDeleteList = () => {
  console.log('🗑️ [PURE-LIST] 刪除列表事件，委派給父組件:', props.list.title)
  emit('list-delete', props.list.id)
}

// 🤖 純渲染：處理 AI 生成任務 (委派給父組件)
const handleAiGenerate = () => {
  console.log('🤖 [PURE-LIST] AI 生成任務事件，委派給父組件:', props.list.title)
  emit('ai-generate', props.list.id)
}

// 開始編輯標題
const startEditTitle = async () => {
  isEditingTitle.value = true
  editingTitle.value = props.list.title
  
  // 等待 DOM 更新後聚焦並全選文字
  await nextTick()
  if (titleInput.value) {
    titleInput.value.focus()
    titleInput.value.select()
  }
}

// 🎯 純渲染：儲存標題變更 (委派給父組件)
const saveTitle = async () => {
  const newTitle = editingTitle.value.trim()
  if (newTitle && newTitle !== props.list.title) {
    console.log('✏️ [PURE-LIST] 更新列表標題事件，委派給父組件:', { old: props.list.title, new: newTitle })
    emit('list-update-title', props.list.id, newTitle)
  }
  isEditingTitle.value = false
}

// 取消編輯
const cancelEdit = () => {
  editingTitle.value = props.list.title
  isEditingTitle.value = false
}
</script>

<style scoped>
/* 🌈 AI 生成按鈕的彩虹魔法動畫 */
.ai-rainbow-magic {
  background: linear-gradient(
    -45deg,
    #ff0000,  /* 紅 */
    #ff8000,  /* 橘 */
    #ffff00,  /* 黃 */
    #80ff00,  /* 黃綠 */
    #00ff00,  /* 綠 */
    #00ff80,  /* 青綠 */
    #00ffff,  /* 青 */
    #0080ff,  /* 藍 */
    #0000ff,  /* 藍紫 */
    #8000ff,  /* 紫 */
    #ff00ff,  /* 洋紅 */
    #ff0080,  /* 粉紅 */
    #ff0000   /* 回到紅色 */
  );
  background-size: 400% 400%;
  animation: rainbowFlow 4s ease-in-out infinite;
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

/* 🌟 彩虹光暈效果 */
.ai-rainbow-magic::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  background: linear-gradient(
    -45deg,
    #ff0000,  /* 紅 */
    #ff8000,  /* 橘 */
    #ffff00,  /* 黃 */
    #80ff00,  /* 黃綠 */
    #00ff00,  /* 綠 */
    #00ff80,  /* 青綠 */
    #00ffff,  /* 青 */
    #0080ff,  /* 藍 */
    #0000ff,  /* 藍紫 */
    #8000ff,  /* 紫 */
    #ff00ff,  /* 洋紅 */
    #ff0080,  /* 粉紅 */
    #ff0000   /* 回到紅色 */
  );
  background-size: 400% 400%;
  border-radius: inherit;
  z-index: -1;
  animation: rainbowFlow 3s ease-in-out infinite;
  opacity: 0.7;
  filter: blur(8px);
}

/* 🌟 內部魔法光芒效果 */
.ai-rainbow-magic::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80%;
  height: 80%;
  background: radial-gradient(
    circle,
    rgba(255,255,255,0.3) 0%,
    rgba(255,255,255,0.1) 50%,
    transparent 70%
  );
  border-radius: inherit;
  transform: translate(-50%, -50%);
  animation: magicPulse 2s ease-in-out infinite;
  pointer-events: none;
}

/* 🌈 彩虹流動動畫 - 慢速流暢變化 */
@keyframes rainbowFlow {
  0% {
    background-position: 0% 50%;
    filter: brightness(1) saturate(1.2);
  }
  20% {
    background-position: 100% 50%;
    filter: brightness(1.1) saturate(1.4);
  }
  40% {
    background-position: 200% 50%;
    filter: brightness(1.2) saturate(1.6);
  }
  60% {
    background-position: 300% 50%;
    filter: brightness(1.1) saturate(1.4);
  }
  80% {
    background-position: 400% 50%;
    filter: brightness(1) saturate(1.2);
  }
  100% {
    background-position: 500% 50%;
    filter: brightness(1) saturate(1.2);
  }
}

/* ✨ 內部光芒脈動動畫 */
@keyframes magicPulse {
  0%, 100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(0.8);
  }
  50% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

/* 🎭 禁用狀態時的樣式調整 */
.ai-rainbow-magic:disabled {
  cursor: wait;
  transform: none;
}

.ai-rainbow-magic:disabled:hover {
  transform: none;
}

/* 📱 手機版拖拽魔法樣式系統 */
/* 💡 十歲小朋友解釋：這些是「魔法咒語」，讓卡片在不同狀態下有不同的樣子！ */

/* 🎭 正在被拖拽的卡片樣式 (mobile-drag) */
/* 💡 十歲小朋友解釋：當你正在拖拽卡片時，卡片會變成這個樣子 */
:deep(.mobile-drag) {
  transform: rotate(5deg) !important;        /* 🔄 稍微傾斜 5 度，看起來像被拿起來 */
  opacity: 0.8 !important;                   /* 🌫️ 變成半透明，表示正在移動 */
  transition: none !important;               /* ⚡ 關閉動畫，讓它可以跟手指同步移動 */
  z-index: 9999 !important;                  /* 🏔️ 放到最上層，不會被其他東西蓋住 */
  pointer-events: none !important;           /* 🚫 不響應點擊，避免干擾拖拽 */
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3) !important; /* ✨ 加陰影，看起來像浮在空中 */
  position: absolute !important;             /* 📍 可以自由移動位置 */
}

/* 👻 幽靈卡片樣式 (mobile-ghost) */
/* 💡 十歲小朋友解釋：原來位置留下的「影子」，告訴你卡片原來在哪裡 */
:deep(.mobile-ghost) {
  opacity: 0.3 !important;                   /* 🌫️ 很淡很淡，像幽靈一樣 */
  background-color: #e5e7eb !important;      /* 🎨 灰色背景 */
  border: 2px dashed #9ca3af !important;     /* 📦 虛線邊框，表示「這裡空了」 */
  transition: all 0.2s ease !important;      /* 🎬 平滑動畫，0.2秒變化 */
}

/* ✨ 被選中的卡片樣式 (mobile-chosen) */
/* 💡 十歲小朋友解釋：當你長按選中卡片時，卡片會「發光」告訴你被選到了 */
:deep(.mobile-chosen) {
  transform: scale(1.05) !important;         /* 🔍 放大 5%，表示被選中 */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2) !important; /* ✨ 加陰影，看起來會發光 */
  transition: transform 0.1s ease !important; /* ⚡ 快速動畫，0.1秒變化 */
}

/* 🎯 SortableJS Fallback 模式的超級魔法樣式！ */
/* 💡 十歲小朋友解釋：這是最重要的魔法！讓卡片的「影分身」跟著手指到處跑！ */
:deep(.sortable-fallback) {
  /* 🏠 位置設定：讓影分身可以飛到任何地方 */
  display: block !important;                 /* 📦 確保顯示出來 */
  position: fixed !important;                /* 🌍 固定在整個螢幕上，不受容器限制 */
  z-index: 100000 !important;                /* 🏔️ 放到最最最上層 (比任何東西都高) */
  
  /* 🚫 行為設定：讓影分身不會干擾其他操作 */
  pointer-events: none !important;           /* 🚫 不能點擊，避免干擾 */
  transition: none !important;               /* ⚡ 關閉所有動畫，100% 跟手指同步 */
  
  /* 🎨 外觀設定：讓影分身看起來很酷 */
  transform: rotate(5deg) !important;        /* 🔄 傾斜 5 度，像被拿起來 */
  opacity: 0.8 !important;                   /* 🌫️ 半透明，表示是「影分身」 */
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4) !important; /* ✨ 超大陰影，像飛在天空中 */
  border-radius: 8px !important;             /* 🟫 圓角，看起來更美 */
  background: white !important;              /* ⚪ 白色背景，清楚易見 */
}

/* 🎯 確保拖拽容器不會限制影分身移動 */
/* 💡 十歲小朋友解釋：這個魔法確保影分身可以飛出原來的「籠子」！ */
:deep(.sortable-drag) {
  position: fixed !important;                /* 🌍 也是固定在整個螢幕 */
  z-index: 100000 !important;                /* 🏔️ 同樣放在最上層 */
  pointer-events: none !important;           /* 🚫 同樣不能點擊 */
}

/* 🎉 十歲小朋友總結：
   這些魔法咒語讓手機版拖拽變得超厲害！
   1. 長按 → 卡片發光 (chosen)
   2. 開始拖拽 → 創造影分身 (fallback)，原位留幽靈 (ghost)
   3. 拖拽中 → 影分身跟著手指跑遍整個螢幕
   4. 放開 → 卡片移動到新位置，影分身和幽靈消失
   
   就像變魔術一樣神奇！✨
*/
</style>