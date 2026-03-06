import 'dotenv/config'
import { supabase } from './lib/supabase.js'

async function testConnection() {
    console.log('🚀 Iniciando teste de conexão com Supabase...')

    const tables = ['User', 'Property', 'LocationState', 'PropertyType']

    for (const table of tables) {
        console.log(`\nConsultando tabela: ${table}...`)
        const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1)

        if (error) {
            console.error(`❌ Erro em ${table}:`, error.message)
        } else {
            console.log(`✅ ${table} acessível! Registros encontrados: ${data.length}`)
            if (data.length > 0) console.table(data)
        }
    }

    console.log('\n--- Fim do Teste ---')
}

testConnection()
