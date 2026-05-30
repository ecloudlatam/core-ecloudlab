
import { Type } from "@google/genai";


export const routerTool = {
    name: "route-intent",
    description: "Identifica la intención del usuario y determina qué agente especializado debe manejar la solicitud",
    parameters: {
        type: Type.OBJECT,
        properties: {
            intent: {
                type: Type.STRING,
                description: "Intención identificada: 'register_debt', 'search_product', 'check_debt', 'contact_owner', 'general_chat', 'close_conversation'",
                enum: ['register_debt', 'search_product', 'check_debt', 'contact_owner', 'general_chat', 'close_conversation']
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

const addedDoubt = {
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


export class ToolService {
    
    getToolsForIntent(intent?: string) {
        const toolMap = {
            'register_debt': [addedDoubt],
            'search_product': [searchProduct],
            'check_debt': [checkDebt],
            'contact_owner': [],
            'general_chat': [],
            'close_conversation': []
        };

        if (!intent || !toolMap[intent]) {
            // Si no hay intención clara, dar acceso a todas las herramientas
            return [addedDoubt, searchProduct, checkDebt];
        }

        return toolMap[intent];
    }
}

