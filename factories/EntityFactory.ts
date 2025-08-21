/**
 * 🏭 Factory Pattern = 工廠生產線
 * 
 * 🤔 想像你要做很多玩具車：
 * 
 * ❌ 沒有工廠的世界：
 * - 每次要車子，你就自己做：找輪子、車身、貼貼紙...
 * - 每個人做出來的車子都不一樣（有些忘記貼貼紙，有些輪子裝歪）
 * - 如果要改車子的顏色，要跟每個人說怎麼改
 * 
 * ✅ 有工廠的世界：
 * - 跟工廠說「我要一台紅色車子」
 * - 工廠知道所有步驟：裝輪子 → 裝車身 → 貼貼紙 → 品質檢查
 * - 每台車子都一模一樣，品質穩定
 * - 要改顏色？只要改工廠的生產線就好
 * 
 * 🎯 這個檔案就是「卡片和列表的工廠」：
 * - 想要新卡片？工廠幫你做：給 ID、設時間、檢查格式
 * - 想要新列表？工廠幫你做：給 ID、設預設值、建立空的卡片陣列
 * - 想要複製卡片？工廠幫你做：複製原本的，但給新的 ID
 * 
 * 🤷‍♂️ 【超重要】與 CardRepository.createCard 有什麼不同？
 * 
 * 🧸 EntityFactory.createCard（這裡）= 玩具積木工廠
 * - 用積木在家裡組裝一個「玩具卡片」
 * - 只是建立記憶體中的假物件，不會存到資料庫
 * - 就像在紙上畫一張卡片，還沒真正印出來
 * - 用途：樂觀 UI 更新時建立「暫時卡片」讓用戶先看到
 * 
 * 🏪 CardRepository.createCard = 真正的卡片印刷廠
 * - 打電話給印刷廠，真的印出一張實體卡片
 * - 會呼叫 API，把卡片存到資料庫裡
 * - 就像真的去印刷店印名片，會有真實的產品
 * - 用途：把卡片真正存到後端資料庫
 * 
  🎯 十歲孩童比喻

  EntityFactory = 在紙上畫一張假鈔
  - 你立刻就能看到「錢」
  - 但不能真的拿去買東西
  - 只是先讓你爽一下 😄

  CardRepository = 去銀行領真鈔
  - 要排隊等待銀行處理
  - 但領到的是真錢，可以買東西
  - 雖然慢，但是有價值的

  🔄 實際運作流程

  用戶點「新增卡片」
        ↓
  1. EntityFactory 做假卡片 ⚡（立刻顯示）
        ↓
  2. CardRepository 做真卡片 🌐（背景處理）
        ↓
  3. 成功：假卡片 → 真卡片 ✅
     失敗：假卡片 → 消失 ❌

  這就是為什麼你的 addCard
  現在變得超快了！用戶點按鈕立刻看到卡片（假的），然後背景悄
  悄地把它變成真的。如果失敗，假卡片就會消失，並顯示錯誤訊息
  。
  就像魔術一樣：先變出假花讓觀眾開心，然後悄悄換成真花！🎩✨  
 * 📋 實際使用流程：
 * 1. 用戶點「新增卡片」
 * 2. EntityFactory.createCard → 做假卡片（用戶立刻看到）⚡
 * 3. CardRepository.createCard → 做真卡片（背景存資料庫）🌐
 * 4. 成功：把假卡片換成真卡片 ✅
 * 5. 失敗：把假卡片丟掉 ❌
 * 
 * 🛒 就像網購：
 * - EntityFactory = 先在購物車裡加商品（還沒真的買）
 * - CardRepository = 按下結帳，真的付錢買下來
 * 
 * 📝 使用方式：
 * const newCard = EntityFactory.createCard({
 *   title: '我的新卡片',
 *   listId: 'list-123'
 * })
 * // 工廠自動幫你加上 ID、時間、預設值等等
 * 
 * 💡 簡單說：不要自己手工做，用工廠統一生產，品質比較好
 */

/**
 * 📋 實體介面定義 - 就像產品的設計圖
 * 
 * 🤔 為什麼要定義這些？
 * - 確保每個卡片/列表/看板都有相同的屬性
 * - 讓 TypeScript 幫我們檢查格式是否正確
 * - 當作「規格書」，告訴工廠要生產什麼樣的產品
 */

// EntityFactory 使用 API 型別，因為要建立資料庫實體
import type { Card } from '@/types/api'

import type { List } from '@/types/api'

// 使用統一的型別定義

import type { Board } from '@/types/api'

// 使用統一的型別定義

/**
 * 🛠️ 建立參數介面 - 工廠的「訂單格式」
 * 
 * 🤔 為什麼要分開定義？
 * - 使用者不需要提供所有屬性（比如 ID、時間等工廠會自動生成）
 * - 只要求必要的資訊，讓使用更簡單
 * - ? 符號表示可選，沒提供就用預設值
 */

// 建立卡片時需要的資訊
interface CreateCardParams {
  title: string        // 必填：卡片標題
  listId: string       // 必填：要放在哪個列表
  description?: string // 可選：卡片描述（沒提供就是空字串）
  position?: number    // 可選：位置（沒提供就是 0）
}

// 建立列表時需要的資訊
interface CreateListParams {
  title: string        // 必填：列表標題
  position?: number    // 可選：位置（沒提供就是 0）
}

// 建立看板時需要的資訊
interface CreateBoardParams {
  title: string        // 必填：看板標題
  description?: string // 可選：看板描述（沒提供就是空字串）
}

export class EntityFactory {
  /**
   * 🏷️ 建立卡片 - 卡片生產線
   * 
   * 🤔 這個函數做什麼？
   * - 接收使用者的「訂單」（標題、列表ID等）
   * - 自動生成完整的卡片，包含所有必要屬性
   * - 就像點餐：你說要什麼，廚房做出完整的餐點
   * 
   * 📝 使用例子：
   * const newCard = EntityFactory.createCard({
   *   title: '實作登入功能',
   *   listId: 'list_abc123',
   *   description: '使用 Firebase Auth',
   *   position: 2
   * })
   * // 結果會得到完整的卡片，包含自動生成的 ID 和時間
   * 
   * 💡 工廠自動做的事：
   * - 生成唯一的 ID
   * - 設定建立和更新時間
   * - 處理預設值（description 和 position）
   * - 清理標題（去除前後空白）
   * 
   * 🔧 參數說明：
   * @param params - 建立卡片需要的資訊
   * @returns 完整的卡片物件
   */
  static createCard(params: CreateCardParams): Card {
    return {
      id: this.generateId('card'),               // 自動生成唯一 ID，格式：card_xxxxx_xxxxx
      title: params.title.trim(),                // 清理標題的前後空白
      description: params.description || '',     // 如果沒提供描述，就用空字串
      position: params.position ?? 0,            // 如果沒提供位置，就用 0（?? 是「空值合併」操作符）
      listId: params.listId,                     // 指定這張卡片屬於哪個列表
      createdAt: new Date(),                     // 自動設定建立時間為現在
      updatedAt: new Date()                      // 自動設定更新時間為現在
    }
  }

  /**
   * 📝 建立列表 - 列表生產線
   * 
   * 🤔 這個函數做什麼？
   * - 建立一個新的空列表
   * - 自動設定所有必要屬性
   * - 就像開設一個新的「待辦事項分類」
   * 
   * 📝 使用例子：
   * const newList = EntityFactory.createList({
   *   title: '進行中',
   *   position: 1
   * })
   * // 結果會得到完整的列表，cards 陣列是空的，等待之後加入卡片
   * 
   * 💡 工廠自動做的事：
   * - 生成唯一的 ID
   * - 建立空的 cards 陣列（新列表一開始沒有卡片）
   * - 設定建立和更新時間
   * - 處理預設位置
   * 
   * 🔧 參數說明：
   * @param params - 建立列表需要的資訊
   * @returns 完整的列表物件
   */
  static createList(params: CreateListParams): List {
    return {
      id: this.generateId('list'),               // 自動生成唯一 ID，格式：list_xxxxx_xxxxx
      title: params.title.trim(),                // 清理標題的前後空白
      position: params.position ?? 0,            // 如果沒提供位置，就用 0
      cards: [],                                 // 新列表一開始是空的，沒有任何卡片
      createdAt: new Date(),                     // 自動設定建立時間為現在
      updatedAt: new Date()                      // 自動設定更新時間為現在
    }
  }

  /**
   * 📋 建立看板 - 看板生產線
   * 
   * 🤔 這個函數做什麼？
   * - 建立一個新的空看板
   * - 自動設定所有必要屬性
   * - 就像建立一個新的「專案工作區」
   * 
   * 📝 使用例子：
   * const newBoard = EntityFactory.createBoard({
   *   title: '網站重構專案',
   *   description: '使用 Vue 3 重構舊網站'
   * })
   * // 結果會得到完整的看板，lists 陣列是空的，等待之後加入列表
   * 
   * 💡 工廠自動做的事：
   * - 生成唯一的 ID
   * - 建立空的 lists 陣列（新看板一開始沒有列表）
   * - 設定建立和更新時間
   * - 處理可選的描述
   * 
   * 🔧 參數說明：
   * @param params - 建立看板需要的資訊
   * @returns 完整的看板物件
   */
  static createBoard(params: CreateBoardParams): Board {
    return {
      id: this.generateId('board'),              // 自動生成唯一 ID，格式：board_xxxxx_xxxxx
      title: params.title.trim(),                // 清理標題的前後空白
      description: params.description || '',     // 如果沒提供描述，就用空字串
      lists: [],                                 // 新看板一開始是空的，沒有任何列表
      createdAt: new Date(),                     // 自動設定建立時間為現在
      updatedAt: new Date()                      // 自動設定更新時間為現在
    }
  }

  /**
   * 🔄 從 API 資料建立卡片 - API 格式轉換器
   * 
   * 🤔 這個函數做什麼？
   * - 把從伺服器拿到的資料轉換成我們程式中使用的格式
   * - 處理不同的命名規則（比如 API 用 list_id，我們用 listId）
   * - 確保資料格式一致，避免程式出錯
   * 
   * 💡 為什麼需要轉換？
   * - API 可能用蛇形命名（snake_case）：created_at, list_id
   * - 我們程式用駝峰命名（camelCase）：createdAt, listId
   * - API 的日期是字串，我們需要 Date 物件
   * - API 可能缺少某些欄位，我們需要設預設值
   * 
   * 📝 使用例子：
   * // API 回傳的資料
   * const apiResponse = {
   *   id: 'card123',
   *   title: '修復 bug',
   *   list_id: 'list456',
   *   created_at: '2024-01-01T10:00:00Z'
   * }
   * 
   * // 轉換成我們的格式
   * const card = EntityFactory.createCardFromApi(apiResponse)
   * // 現在 card.listId 可以使用，card.createdAt 是 Date 物件
   * 
   * 🔧 參數說明：
   * @param apiData - 從 API 收到的原始資料
   * @returns 轉換後的標準卡片物件
   */
  static createCardFromApi(apiData: any): Card {
    return {
      id: apiData.id,                                                    // ID 保持不變
      title: apiData.title || '',                                        // 標題，如果是 null 就用空字串
      description: apiData.description || '',                            // 描述，如果是 null 就用空字串
      position: apiData.position || 0,                                   // 位置，如果是 null 就用 0
      listId: apiData.list_id,                                          // 🔄 蛇形轉駝峰：list_id → listId
      createdAt: new Date(apiData.created_at),                          // 🔄 字串轉 Date：created_at → createdAt
      updatedAt: new Date(apiData.updated_at || apiData.created_at)     // 🔄 字串轉 Date，如果沒有更新時間就用建立時間
    }
  }

  /**
   * 📋 從 API 資料建立列表 - API 格式轉換器
   * 
   * 🤔 這個函數做什麼？
   * - 轉換 API 的列表資料格式
   * - 同時轉換列表中包含的所有卡片
   * - 處理巢狀資料結構
   * 
   * 📝 使用例子：
   * // API 回傳的資料
   * const apiResponse = {
   *   id: 'list123',
   *   title: '待辦事項',
   *   cards: [{ id: 'card1', title: '任務1', list_id: 'list123' }],
   *   created_at: '2024-01-01T10:00:00Z'
   * }
   * 
   * const list = EntityFactory.createListFromApi(apiResponse)
   * // 列表和其中的卡片都會被正確轉換
   * 
   * 🔧 參數說明：
   * @param apiData - 從 API 收到的原始列表資料
   * @returns 轉換後的標準列表物件
   */
  static createListFromApi(apiData: any): List {
    return {
      id: apiData.id,                                                    // ID 保持不變
      title: apiData.title || '',                                        // 標題，如果是 null 就用空字串
      position: apiData.position || 0,                                   // 位置，如果是 null 就用 0
      cards: apiData.cards ? apiData.cards.map(this.createCardFromApi) : [], // 🔄 轉換所有卡片，如果沒有卡片就用空陣列
      createdAt: new Date(apiData.created_at),                          // 🔄 字串轉 Date
      updatedAt: new Date(apiData.updated_at || apiData.created_at)     // 🔄 字串轉 Date
    }
  }

  /**
   * 📄 複製卡片 - 卡片影印機
   * 
   * 🤔 這個函數做什麼？
   * - 建立一張現有卡片的副本
   * - 可以選擇性地修改某些屬性
   * - 新卡片會有新的 ID 和時間，但內容來自原卡片
   * 
   * 💡 為什麼需要複製？
   * - 建立範本卡片的副本
   * - 移動卡片到不同列表時
   * - 快速建立相似的卡片
   * 
   * 📝 使用例子：
   * const originalCard = { id: 'card1', title: '原始任務', listId: 'list1' }
   * 
   * // 複製到不同列表
   * const copiedCard = EntityFactory.cloneCard(originalCard, {
   *   listId: 'list2'
   * })
   * // 結果：新卡片有新 ID，但標題相同，在不同列表中
   * 
   * // 複製並修改標題
   * const modifiedCard = EntityFactory.cloneCard(originalCard, {
   *   title: '修改後的任務'
   * })
   * 
   * 🔧 參數說明：
   * @param card - 要複製的原始卡片
   * @param overrides - 要覆蓋的屬性（可選）
   * @returns 新的卡片副本
   */
  static cloneCard(card: Card, overrides: Partial<CreateCardParams> = {}): Card {
    return this.createCard({
      title: overrides.title || card.title,                    // 使用新標題，或保持原標題
      listId: overrides.listId || card.listId,                 // 使用新列表ID，或保持原列表
      description: overrides.description || card.description,   // 使用新描述，或保持原描述
      position: overrides.position ?? card.position            // 使用新位置，或保持原位置
    })
    // 注意：這會產生新的 ID、createdAt、updatedAt
  }

  /**
   * 📋 複製列表 - 列表影印機
   * 
   * 🤔 這個函數做什麼？
   * - 建立一個現有列表的完整副本
   * - 包括列表中的所有卡片也會被複製
   * - 所有複製的內容都會有新的 ID
   * 
   * 💡 為什麼需要複製列表？
   * - 建立專案範本
   * - 複製工作流程到新專案
   * - 建立備份或測試用的列表
   * 
   * 📝 使用例子：
   * const originalList = {
   *   id: 'list1',
   *   title: '開發流程',
   *   cards: [
   *     { id: 'card1', title: '分析需求', listId: 'list1' },
   *     { id: 'card2', title: '設計介面', listId: 'list1' }
   *   ]
   * }
   * 
   * const copiedList = EntityFactory.cloneList(originalList)
   * // 結果：
   * // - 新列表有新 ID，標題是 "開發流程 (副本)"
   * // - 包含 2 張新卡片，都有新 ID，但屬於新列表
   * 
   * 🔧 參數說明：
   * @param list - 要複製的原始列表
   * @param overrides - 要覆蓋的屬性（可選）
   * @returns 新的列表副本（包含所有卡片的副本）
   */
  static cloneList(list: List, overrides: Partial<CreateListParams> = {}): List {
    // 先建立新列表
    const newList = this.createList({
      title: overrides.title || `${list.title} (副本)`,        // 預設在標題後加 "(副本)"
      position: overrides.position ?? list.position            // 使用新位置，或保持原位置
    })
    
    // 複製所有卡片，並讓它們屬於新列表
    newList.cards = list.cards.map(card => 
      this.cloneCard(card, { listId: newList.id })            // 每張卡片都指向新列表的 ID
    )
    
    return newList
  }

  /**
   * 🏷️ 生成唯一 ID - ID 製造機
   * 
   * 🤔 這個函數做什麼？
   * - 生成全世界唯一的 ID
   * - 組合時間戳記和隨機數，確保不會重複
   * - 加上前綴，讓人一看就知道是什麼類型的 ID
   * 
   * 💡 ID 組成規則：
   * - 前綴：告訴我們這是什麼（card, list, board）
   * - 時間戳記：確保時間上的唯一性
   * - 隨機數：防止同一毫秒內產生重複 ID
   * 
   * 📝 生成的 ID 範例：
   * - 卡片：card_1a2b3c4d_5e6f7g8h
   * - 列表：list_1a2b3c4d_9i0j1k2l
   * - 看板：board_1a2b3c4d_3m4n5o6p
   * 
   * 🔧 技術細節：
   * - toString(36) 把數字轉成 36 進位（包含 0-9 和 a-z）
   * - Date.now() 取得現在的毫秒時間戳記
   * - Math.random() 產生 0-1 之間的隨機數
   * 
   * 🔧 參數說明：
   * @param prefix - ID 的前綴（如 'card', 'list', 'board'）
   * @returns 唯一的 ID 字串
   */
  private static generateId(prefix: string): string {
    const timestamp = Date.now().toString(36)              // 時間戳記轉 36 進位：1640995200000 → 'abc123'
    const randomPart = Math.random().toString(36).substr(2, 8)  // 隨機數轉 36 進位並取 8 位：0.123456 → 'def456gh'
    return `${prefix}_${timestamp}_${randomPart}`          // 組合結果：'card_abc123_def456gh'
  }

  /**
   * ✅ 驗證卡片 - 卡片品質檢查員
   * 
   * 🤔 這個函數做什麼？
   * - 檢查卡片的資料是否正確
   * - 找出所有問題並回報
   * - 確保卡片符合規格，避免程式出錯
   * 
   * 💡 為什麼要驗證？
   * - 防止使用者輸入空白標題
   * - 確保卡片有歸屬的列表
   * - 檢查位置是合理的數字
   * - 在存檔前就發現問題，不要等到程式當掉
   * 
   * 📝 使用例子：
   * const cardData = {
   *   title: '',           // ❌ 空標題
   *   listId: null,        // ❌ 沒有列表
   *   position: -1         // ❌ 負數位置
   * }
   * 
   * const errors = EntityFactory.validateCard(cardData)
   * console.log(errors)
   * // 輸出：['卡片標題不能為空', '卡片必須屬於一個列表', '卡片位置必須是非負數']
   * 
   * if (errors.length === 0) {
   *   // 資料正確，可以建立卡片
   * } else {
   *   // 有問題，顯示錯誤訊息給使用者
   * }
   * 
   * 🔧 參數說明：
   * @param card - 要驗證的卡片資料（可能不完整）
   * @returns 錯誤訊息陣列，空陣列表示沒有錯誤
   */
  static validateCard(card: Partial<Card>): string[] {
    const errors: string[] = []                             // 收集所有錯誤的陣列
    
    // 檢查標題是否為空
    if (!card.title?.trim()) {                              // ?. 是安全導航，避免 null.trim() 出錯
      errors.push('卡片標題不能為空')
    }
    
    // 檢查是否有指定列表
    if (!card.listId) {
      errors.push('卡片必須屬於一個列表')
    }
    
    // 檢查位置是否為有效數字
    if (typeof card.position !== 'number' || card.position < 0) {
      errors.push('卡片位置必須是非負數')
    }
    
    return errors                                            // 回傳所有發現的問題
  }

  /**
   * ✅ 驗證列表 - 列表品質檢查員
   * 
   * 🤔 這個函數做什麼？
   * - 檢查列表的資料是否正確
   * - 確保列表符合規格
   * - 在建立或更新前驗證資料
   * 
   * 📝 使用例子：
   * const listData = {
   *   title: '   ',        // ❌ 只有空白的標題
   *   position: 'abc'      // ❌ 位置不是數字
   * }
   * 
   * const errors = EntityFactory.validateList(listData)
   * // 輸出：['列表標題不能為空', '列表位置必須是非負數']
   * 
   * 🔧 參數說明：
   * @param list - 要驗證的列表資料（可能不完整）
   * @returns 錯誤訊息陣列，空陣列表示沒有錯誤
   */
  static validateList(list: Partial<List>): string[] {
    const errors: string[] = []                             // 收集所有錯誤的陣列
    
    // 檢查標題是否為空（包括只有空白的情況）
    if (!list.title?.trim()) {
      errors.push('列表標題不能為空')
    }
    
    // 檢查位置是否為有效數字
    if (typeof list.position !== 'number' || list.position < 0) {
      errors.push('列表位置必須是非負數')
    }
    
    return errors                                            // 回傳所有發現的問題
  }
}