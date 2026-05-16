# SOBERBA

> *O céu é proibido. Empilhe ainda assim.*

Tetris físico de pedras antigas. Não há linhas pra completar — só uma torre que sobe, balança e eventualmente desaba sob o próprio peso. Sua pontuação é a altura final em metros, antes do colapso.

## Stack

- **Phaser 3** (com Matter.js embutido pra física)
- **TypeScript** + **Vite**
- HTML5, deploy estático em qualquer portal (Itch.io, CrazyGames, Poki)

## Como rodar

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

Build de produção:

```bash
npm run build
# saída em dist/, pronto pra subir em qualquer portal HTML5
```

## Controles

| Ação        | Teclado          | Gamepad      | Touch              |
|-------------|------------------|--------------|--------------------|
| Mover       | ← → / A D        | D-pad / stick| Swipe horizontal   |
| Rotacionar  | ↑ / W            | A            | Tap                |
| Soft drop   | ↓ / S            | ↓ / stick ↓  | —                  |
| Hard drop   | Espaço           | B / ↑        | Swipe pra baixo    |

## Estrutura

```
src/
  main.ts                  # config do Phaser
  scenes/
    BootScene.ts
    GameScene.ts           # loop principal + física + spawn
    GameOverScene.ts
  input/
    InputManager.ts        # teclado + gamepad + touch unificados
  game/
    Tetromino.ts           # shapes, paleta de pedra, spawn de compound bodies
```

## Roadmap (o que falta)

- [ ] Detecção de colapso (game over real, hoje só spawna infinito)
- [ ] Câmera que sobe conforme a torre cresce
- [ ] Score por altura em tempo real no HUD
- [ ] Animação cinematográfica do colapso (slow-mo + câmera afasta)
- [ ] Sons (assentamento de pedra, vento de altura, estrondo do colapso)
- [ ] Próxima peça preview
- [ ] Runas/símbolos arcaicos nas faces das pedras
- [ ] Integração SDK CrazyGames / Poki pra ads
