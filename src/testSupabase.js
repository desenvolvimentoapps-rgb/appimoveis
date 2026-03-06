import 'dotenv/config'
import { supabase } from './lib/supabase.js'

async function testConnection() {
    console.log('Testando conexão com Supabase...')
    const { data, error } = await supabase
        .from('usuarios')
        .select('*')

    if (error) {
        console.error('Erro ao buscar usuários:', error.message)
        return
    }

    console.log('Conexão bem sucedida! Usuários encontrados:')
    console.table(data)
}

testConnection()
