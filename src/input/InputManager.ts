import Phaser from 'phaser'

export type GameAction = 'moveLeft' | 'moveRight' | 'rotate' | 'softDrop' | 'hardDrop'

interface ActionState {
  pressed: boolean
  justPressed: boolean
}

const ALL_ACTIONS: GameAction[] = ['moveLeft', 'moveRight', 'rotate', 'softDrop', 'hardDrop']

export class InputManager {
  private scene: Phaser.Scene
  private actions = new Map<GameAction, ActionState>()
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {}
  private gamepad: Phaser.Input.Gamepad.Gamepad | null = null
  private touchBuffer: GameAction[] = []
  private prevPressed = new Map<GameAction, boolean>()

  private touchStartX = 0
  private touchStartY = 0
  private touchStartTime = 0
  private readonly SWIPE_THRESHOLD = 30
  private readonly TAP_TIME = 200

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    for (const a of ALL_ACTIONS) {
      this.actions.set(a, { pressed: false, justPressed: false })
      this.prevPressed.set(a, false)
    }
    this.setupKeyboard()
    this.setupGamepad()
    this.setupTouch()
  }

  private setupKeyboard() {
    const kb = this.scene.input.keyboard
    if (!kb) return
    this.keys.left = kb.addKey('LEFT')
    this.keys.right = kb.addKey('RIGHT')
    this.keys.down = kb.addKey('DOWN')
    this.keys.up = kb.addKey('UP')
    this.keys.space = kb.addKey('SPACE')
    this.keys.a = kb.addKey('A')
    this.keys.d = kb.addKey('D')
    this.keys.s = kb.addKey('S')
    this.keys.w = kb.addKey('W')
  }

  private setupGamepad() {
    const gp = this.scene.input.gamepad
    if (!gp) return
    gp.once('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
      this.gamepad = pad
    })
    if (gp.total > 0) this.gamepad = gp.getPad(0)
  }

  private setupTouch() {
    this.scene.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.touchStartX = p.x
      this.touchStartY = p.y
      this.touchStartTime = this.scene.time.now
    })
    this.scene.input.on('pointerup', (p: Phaser.Input.Pointer) => {
      const dx = p.x - this.touchStartX
      const dy = p.y - this.touchStartY
      const dt = this.scene.time.now - this.touchStartTime
      const absDx = Math.abs(dx)
      const absDy = Math.abs(dy)

      if (dt < this.TAP_TIME && absDx < this.SWIPE_THRESHOLD && absDy < this.SWIPE_THRESHOLD) {
        this.touchBuffer.push('rotate')
        return
      }
      if (absDx > absDy && absDx > this.SWIPE_THRESHOLD) {
        this.touchBuffer.push(dx > 0 ? 'moveRight' : 'moveLeft')
      } else if (absDy > this.SWIPE_THRESHOLD) {
        this.touchBuffer.push(dy > 0 ? 'hardDrop' : 'rotate')
      }
    })
  }

  update() {
    for (const a of ALL_ACTIONS) {
      this.prevPressed.set(a, this.actions.get(a)!.pressed)
      const s = this.actions.get(a)!
      s.pressed = false
      s.justPressed = false
    }

    const k = this.keys
    if (k.left?.isDown || k.a?.isDown) this.actions.get('moveLeft')!.pressed = true
    if (k.right?.isDown || k.d?.isDown) this.actions.get('moveRight')!.pressed = true
    if (k.down?.isDown || k.s?.isDown) this.actions.get('softDrop')!.pressed = true
    if (k.up?.isDown || k.w?.isDown) this.actions.get('rotate')!.pressed = true
    if (k.space?.isDown) this.actions.get('hardDrop')!.pressed = true

    if (this.gamepad) {
      const pad = this.gamepad
      const lx = pad.leftStick.x
      const ly = pad.leftStick.y
      if (lx < -0.5 || pad.left) this.actions.get('moveLeft')!.pressed = true
      if (lx > 0.5 || pad.right) this.actions.get('moveRight')!.pressed = true
      if (pad.down || ly > 0.5) this.actions.get('softDrop')!.pressed = true
      if (pad.A) this.actions.get('rotate')!.pressed = true
      if (pad.B || pad.up) this.actions.get('hardDrop')!.pressed = true
    }

    for (const a of this.touchBuffer) {
      this.actions.get(a)!.pressed = true
    }
    this.touchBuffer = []

    for (const a of ALL_ACTIONS) {
      const s = this.actions.get(a)!
      if (s.pressed && !this.prevPressed.get(a)) s.justPressed = true
    }
  }

  isPressed(action: GameAction): boolean {
    return this.actions.get(action)?.pressed ?? false
  }

  justPressed(action: GameAction): boolean {
    return this.actions.get(action)?.justPressed ?? false
  }
}
