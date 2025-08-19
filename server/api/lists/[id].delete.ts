// 刪除列表的 API 端點
import { serverSupabaseClient } from '~/server/utils/supabase'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabaseClient(event)

  // 驗證用戶身份
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  try {
    const id = getRouterParam(event, 'id')
    
    // 🔍 [API] 記錄收到的請求資料
    console.log('🗑️ [API] DELETE /api/lists/[id] 收到請求:')
    console.log('  📋 列表 ID:', id)
    console.log('  👤 用戶 ID:', user.id)
    
    if (!id) {
      console.log('❌ [API] 錯誤: 列表 ID 為空')
      throw createError({
        statusCode: 400,
        message: '列表 ID 為必填參數'
      })
    }

    // 查詢刪除前的列表資訊（用於記錄和驗證）
    console.log('🔍 [API] 查詢要刪除的列表資訊...')
    const { data: existingList, error: queryError } = await supabase
      .from('lists')
      .select('id, title, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (queryError) {
      console.error('❌ [API] 查詢列表錯誤:', queryError.message)
      throw createError({
        statusCode: 500,
        message: '查詢列表失敗'
      })
    }

    if (!existingList) {
      console.log('❌ [API] 錯誤: 找不到要刪除的列表或無權限刪除')
      throw createError({
        statusCode: 404,
        message: '找不到要刪除的列表或無權限刪除'
      })
    }

    console.log('📊 [API] 找到要刪除的列表:', {
      id: existingList.id,
      title: existingList.title,
      cardsCount: existingList.cards?.[0]?.count || 0
    })

    // 刪除列表（由於設定了 CASCADE，相關卡片會自動刪除）
    console.log('🔄 [API] 開始執行 Supabase 刪除操作...')
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('❌ [API] Supabase 刪除錯誤:')
      console.error('  🔍 錯誤訊息:', error.message)
      console.error('  🔍 錯誤代碼:', error.code)
      console.error('  🔍 錯誤詳情:', error.details)
      console.error('  🔍 錯誤提示:', error.hint)
      throw createError({
        statusCode: 500,
        message: '刪除列表失敗'
      })
    }

    console.log('✅ [API] Supabase 刪除操作成功!')
    console.log('📋 [API] 已刪除列表:', existingList.title)
    console.log('💡 [API] 相關卡片也會自動刪除 (CASCADE)')

    return { 
      id,
      message: '列表已成功刪除',
      deletedList: {
        id: existingList.id,
        title: existingList.title
      }
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      console.log('🚨 [API] 已知錯誤被重新拋出:', error)
      throw error
    }
    
    console.error('💥 [API] 未預期的錯誤:')
    console.error('  🔍 錯誤類型:', typeof error)
    console.error('  🔍 錯誤內容:', error)
    console.error('  🔍 錯誤堆疊:', error instanceof Error ? error.stack : '無堆疊資訊')
    
    throw createError({
      statusCode: 500,
      message: '伺服器內部錯誤'
    })
  }
})