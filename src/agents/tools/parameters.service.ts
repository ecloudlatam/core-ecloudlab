
import { SupabaseService } from "@app/supabase";
import { Type } from "@google/genai";


export const routerTool = {
    name: "route-intent",
    description: "Identifica la intención del usuario y determina qué agente especializado debe manejar la solicitud",
    parameters: {
        type: Type.OBJECT,
        properties: {
            intent: {
                type: Type.STRING,
                description: "Intención identificada",
                enum: ['register_debt','check_debt','search_product', 'register_product', 'contact_owner', 'general_chat', 'close_conversation']
            },
            confidence: {
                type: Type.NUMBER,
                description: "Nivel de confianza de la intención (0-1)"
            },
            extractedData: {
                type: Type.OBJECT,
                description: "Datos extraídos del mensaje del usuario (productos, fechas, cantidades, etc.)"
            }
        },
        required: ['intent', 'confidence']
    }
};

const registerDoubt = {
    name: "added-new-doubt",
    description: "Registra una nueva deuda del cliente",
    parameters: {
        type: Type.OBJECT,
        properties: {
            date: {
                type: Type.STRING,
                description: 'Fecha de la deuda (formato: "YYYY-MM-DD")',
            },
            product: {
                type: Type.STRING,
                description: "Nombre del producto (ej: 'pollo de 1/4 libra')"
            },
            quantity: {
                type: Type.NUMBER,
                description: "Cantidad del producto"
            },
            amount: {
                type: Type.NUMBER,
                description: "Monto de la deuda en dólares"
            }
        },
        required: ['date', 'product']
    }
};

const searchProduct = {
    name: "search-product",
    description: "Busca un producto en el inventario de la tienda",
    parameters: {
        type: Type.OBJECT,
        properties: {
            productName: {
                type: Type.STRING,
                description: "Nombre del producto a buscar"
            }
        },
        required: ['productName']
    }
};

const checkDebt = {
    name: "check-debt",
    description: "Consulta el saldo pendiente de un cliente",
    parameters: {
        type: Type.OBJECT,
        properties: {
            customerId: {
                type: Type.STRING,
                description: "ID del cliente (opcional, si no se proporciona usa el cliente actual)"
            }
        }
    }
};

const registerProduct = {
    name:"added-product",
    description:"registrar un nuevo producto al local",
    parameters:{
        type: Type.OBJECT,
        properties:{
            name: {
                type: Type.STRING,
                description:"Nombre del producto"
            },
            description:{
                type: Type.STRING,
                description:"Descripcion del producto"
            },
            price:{
                type: Type.NUMBER,
                description: "Valor de producto"
            }
        }
    }
}

export class ToolService {

    constructor(private readonly supabase: SupabaseService){}
    
    getTool() {
        const db =  this.supabase.getClient()
        
    }   


    getToolsForIntent(intent?: string) {
        const toolMap = {
            'check_debt': [checkDebt],
            'register_debt': [registerDoubt],
            'search_product': [searchProduct],
            'register_product':[registerProduct],
            'contact_owner': [],
            'general_chat': [],
            'close_conversation': []
        };

        if (!intent || !toolMap[intent]) {
            // Si no hay intención clara, dar acceso a todas las herramientas
            return [checkDebt];
        }

        return toolMap[intent];
    }
}

