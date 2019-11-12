export class Scene {
  private scene: HTMLDivElement;
  private map: HTMLDivElement;
  private root: HTMLElement;

  private isDrag = false;
  private x = 0;
  private y = 0;

  constructor(scene: string, map: string) {
    this.scene = document.querySelector(scene);
    this.map = document.querySelector(map);
    this.root = document.documentElement;
    this.handleResize();
    window.addEventListener('resize', (e) => this.handleResize(e));
    this.scene.addEventListener('wheel', (e) => this.handleWheel(e));
    this.scene.addEventListener('mousedown', (e) => this.handleDown(e));
    this.scene.addEventListener('mousemove', (e) => this.handleMove(e));
    this.scene.addEventListener('mouseup', (e) => this.handleUp(e));
  }

  handleResize(e?: UIEvent) {
    const diff = window.innerWidth > 1000 ? 400 + 110 : 160 + 60;
    const battlefieldSize = Math.min(window.innerHeight, window.innerWidth - diff);
    this.root.style.setProperty('--battlefield-size', battlefieldSize + 'px');
  }

  handleWheel(e: WheelEvent) {
    const delta = e.deltaY || e.detail;
    e.preventDefault ? e.preventDefault() : (e.returnValue = false);
    const transform = this.map.style.transform;
    if (transform) {
      const match = /scale\((.*)\)/.exec(transform);
      let value = parseFloat(match[1]);
      value -= delta / 1500;
      if (value > 0 && value < 3) {
        this.map.style.transform = `scale(${value})`;
      }
    } else {
      let value = 1;
      value -= delta / 1500;
      this.map.style.transform = `scale(${value})`;
    }
  }

  handleDown(e: MouseEvent) {
    if (e && (e.button === 1)) {
      this.isDrag = true;
      this.x = e.clientX;
      this.y = e.clientY;
    }
  }
  handleMove(e: MouseEvent) {
    if (this.isDrag) {
      const difX = this.x - e.clientX;
      const difY = this.y - e.clientY;
      this.x = e.clientX;
      this.y = e.clientY;
      this.moveMap(difX, difY);
    }
  }
  handleUp(e: MouseEvent) {
    if (e && (e.button === 1)) {
      this.isDrag = false;
    }
  }

  moveMap(difX, difY) {
    const y = this.map.style.marginTop;
    const x = this.map.style.marginLeft;
    const matchY = y ? /(.*)px/.exec(y)[1] : '0';
    const matchX = x ? /(.*)px/.exec(x)[1] : '0';
    let valueY = parseFloat(matchY);
    let valueX = parseFloat(matchX);
    valueY -= difY;
    valueX -= difX;
    this.map.style.marginTop = `${valueY}px`;
    this.map.style.marginLeft = `${valueX}px`;
  }
}
