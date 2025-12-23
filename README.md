# 🕵️ Código Secreto

Un juego web multijugador en español basado en **Codenames** de Vlaada Chvátil.

## 🎮 Cómo Jugar

1. **Crear o unirse a una sala** - El anfitrión crea una sala y comparte el código de 6 caracteres o QR
2. **Elegir equipo y rol** - Rojo vs Azul, cada equipo necesita un Jefe de Espías y Agentes de Campo
3. **El Jefe de Espías da pistas** - Una palabra + número de cartas relacionadas
4. **Los Agentes adivinan** - Tocan las cartas que creen corresponden a la pista
5. **¡Evita al Asesino!** - Si tocas la carta del asesino, ¡pierdes inmediatamente!

## 🚀 Despliegue en Vercel

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Construir para producción
npm run build

# Desplegar en Vercel
vercel
```

## 🛠️ Tecnologías

- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Zustand** - Estado global (si se necesita)
- **QRCode** - Generación de códigos QR

## 📱 Características

- ✅ 500+ palabras en español
- ✅ Salas con códigos únicos
- ✅ Códigos QR para unirse fácilmente
- ✅ Diseño responsive (móvil primero)
- ✅ Vista especial para Jefe de Espías
- ✅ Actualización en tiempo real (polling)
- ✅ Historial de pistas
- ✅ Reiniciar partida

## 📁 Estructura

```
src/
├── app/
│   ├── api/game/route.ts    # API endpoints
│   ├── sala/[roomCode]/     # Página de sala
│   ├── page.tsx             # Página principal
│   ├── layout.tsx           # Layout global
│   └── globals.css          # Estilos globales
├── components/
│   ├── GameBoard.tsx        # Tablero de juego
│   ├── GameCard.tsx         # Carta individual
│   ├── TeamPanel.tsx        # Panel de equipo
│   ├── ClueInput.tsx        # Input de pistas
│   └── QRCode.tsx           # Componente QR
├── data/
│   └── words.ts             # Base de datos de palabras
├── hooks/
│   └── useGame.ts           # Hook de estado del juego
├── lib/
│   ├── gameLogic.ts         # Lógica del juego
│   └── gameStore.ts         # Almacén en memoria
└── types/
    └── game.ts              # Tipos TypeScript
```

## 🎯 Reglas del Juego

- **9 cartas** para el equipo que empieza, **8** para el otro
- **7 cartas neutrales** y **1 asesino**
- El Jefe de Espías ve todos los colores
- Los Agentes solo ven las cartas reveladas
- Puedes adivinar hasta (número de pista + 1) cartas
- Si tocas una carta neutral o del equipo contrario, termina tu turno
- ¡El primer equipo en encontrar todas sus cartas gana!

---

Basado en [Codenames](https://czechgames.com/en/codenames/) de Czech Games Edition
