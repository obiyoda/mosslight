import Phaser from 'phaser';
import './style.css';

const W = 960, H = 512, REACH = 64;
const ui = Object.fromEntries(['wood', 'stone', 'message', 'pause'].map(id => [id, document.getElementById(id)]));

class Clearing extends Phaser.Scene {
  constructor() { super('Clearing'); }

  create() {
    this.supplies = { wood: 0, stone: 0 };
    this.paused = false;
    this.lastGather = -1000;
    this.gathered = new Set();
    this.resources = [];
    this.drawGround();
    this.makeTextures();
    const trees = [[102,110],[190,93],[283,122],[377,75],[532,99],[671,81],[771,112],[859,79],[69,222],[172,204],[320,228],[631,194],[749,240],[884,207],[101,354],[225,359],[350,391],[569,362],[690,381],[830,353],[146,462],[459,457],[773,470],[912,454]];
    const rocks = [[242,267],[393,169],[577,257],[807,291],[64,432],[610,454],[901,334]];
    for (const [x,y] of trees) this.addResource(x,y,'wood');
    for (const [x,y] of rocks) this.addResource(x,y,'stone');
    this.fire = this.add.image(471,293,'fire').setOrigin(.5,1).setDepth(293);
    this.glow = this.add.circle(471,282,28,0xffdc86,.1).setDepth(1);
    this.player = this.add.image(455,235,'player').setOrigin(.5,1).setDepth(235);
    this.cursor = this.add.graphics().setDepth(1000);
    this.hint = this.add.text(0,0,'', { fontFamily: 'monospace', fontSize: '11px', color:'#fff1c7', backgroundColor:'#253a29', padding:{ x:8,y:5 } }).setOrigin(.5,1).setDepth(1001);
    this.pauseLabel = this.add.text(W/2,H/2,'A LITTLE BREATHER\n\nPress Esc or Resume to wander again', {fontFamily:'monospace',fontSize:'18px',align:'center',backgroundColor:'#1c302bed',padding:{x:35,y:30},color:'#e8e1b8'}).setOrigin(.5).setDepth(2000).setVisible(false);
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E,UP,DOWN,LEFT,RIGHT');
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard.on('keydown-E', () => this.gather(this.nearest()));
    this.input.on('pointerdown', pointer => {
      const target = this.resources.filter(r => r.remaining > 0 && Math.hypot(pointer.x-r.x,pointer.y-(r.y-17)) < (r.kind === 'wood' ? 30 : 22)).sort((a,b) => b.y-a.y)[0];
      if (target) this.gather(target);
    });
    const toggle = () => this.togglePause();
    ui.pause.addEventListener('click', toggle);
    this.events.once('shutdown', () => ui.pause.removeEventListener('click', toggle));
  }

  drawGround() {
    const g = this.add.graphics();
    const random = new Phaser.Math.RandomDataGenerator(['mosslight-clearing']);
    const colors = [0x78954f,0x7a9750,0x76924c,0x7c9851,0x73914c];
    for(let y=0;y<H;y+=16) for(let x=0;x<W;x+=16) {
      g.fillStyle(random.pick(colors)).fillRect(x,y,16,16);
      if(random.frac()>.64) g.fillStyle(0x8ba759,.6).fillRect(x+random.between(2,12),y+random.between(2,12),2,3);
    }
    // A soft earth clearing and stepping stones around the starting fire.
    g.fillStyle(0x9c9d62).fillEllipse(466,285,196,128);
    g.fillStyle(0xaaa36b).fillEllipse(466,285,162,101);
    for(let i=0;i<100;i++) {
      const x=random.between(390,542), y=random.between(246,321);
      if(Math.hypot((x-466)/1.7,y-285)<45) g.fillStyle(random.pick([0xb7ad78,0x98935c])).fillRect(x,y,3,2);
    }
    // Small pond, reeds, and flowers make the gathering clearing feel inhabited.
    g.fillStyle(0x536e41).fillRoundedRect(32,26,132,50,20);
    g.fillStyle(0x618b85).fillRoundedRect(38,30,119,40,17);
    g.fillStyle(0x8db2a0).fillRect(57,39,28,2).fillRect(113,55,27,2);
    g.fillStyle(0x44663e).fillRect(42,59,3,18).fillRect(48,63,3,15).fillRect(148,29,3,15);
    for(let i=0;i<130;i++) {
      const x=random.between(12,W-12), y=random.between(14,H-10);
      if(Math.hypot(x-466,y-282)<115) continue;
      g.fillStyle(0x5e7e41).fillRect(x,y,2,5);
      g.fillStyle(random.pick([0xe0cd8c,0xe3bca5,0xb0c889])).fillRect(x-1,y-2,4,3);
    }
  }

  makeTextures() {
    const texture = (name,w,h,draw) => {
      if(this.textures.exists(name)) return;
      const g=this.add.graphics();
      const r=(color,x,y,width,height)=>g.fillStyle(color).fillRect(x,y,width,height);
      draw(r,g); g.generateTexture(name,w,h); g.destroy();
    };
    texture('wood',64,80,r=>{
      r(0x627b40,9,67,47,9); r(0x624c31,27,42,12,33); r(0x92704a,29,43,5,29);
      r(0x315339,8,29,48,33); r(0x315339,16,17,33,51);
      r(0x42643c,5,25,49,28); r(0x42643c,16,9,30,44);
      r(0x577d42,11,24,39,22); r(0x577d42,19,7,24,40);
      r(0x6b8c48,20,10,17,8); r(0x6b8c48,12,27,13,9); r(0x86a255,24,12,8,4);
      r(0x365a37,35,43,14,8); r(0x718f47,36,28,10,6);
    });
    texture('stone',42,34,r=>{
      r(0x617840,2,25,37,8); r(0x626f67,4,12,33,17); r(0x7e8980,8,6,24,20);
      r(0x9da698,12,4,14,16); r(0xb4bba3,13,6,11,4); r(0x596b60,25,16,11,10); r(0x7d9259,7,24,10,3);
    });
    texture('player',28,40,r=>{
      r(0x60743e,2,34,24,5); r(0x3a4234,7,29,5,8); r(0x3a4234,17,29,5,8);
      r(0xc59963,3,18,5,10); r(0xc59963,22,18,4,10);
      r(0xb66d4d,7,16,15,15); r(0xd39a60,8,17,4,12); r(0x785441,8,28,13,3);
      r(0xe3bd86,8,7,14,12); r(0x4a4030,8,4,14,6); r(0x4a4030,6,7,5,6);
      r(0x304739,15,11,2,3); r(0x304739,21,11,2,3);
      r(0xa9b789,5,4,20,4); r(0xc8c995,9,0,12,6); r(0x6c875d,3,7,24,3);
      r(0xf1ce89,12,21,5,3);
    });
    texture('fire',44,42,r=>{
      r(0x777b65,4,30,35,9); r(0xa3a18a,4,29,8,6); r(0xada68c,32,29,8,6);
      r(0x755134,10,29,24,7); r(0xa37946,15,25,19,5);
      r(0xd58242,13,13,18,16); r(0xf2b658,17,7,11,20); r(0xf3d48b,19,15,6,13); r(0xf2b658,23,3,4,7);
    });
  }

  addResource(x,y,kind) {
    const image=this.add.image(x,y,kind).setOrigin(.5,1).setDepth(y);
    this.resources.push({x,y,kind,image,remaining:kind==='wood'?3:2});
  }

  nearest() {
    return this.resources.filter(r=>r.remaining>0 && this.distance(r)<REACH).sort((a,b)=>this.distance(a)-this.distance(b))[0];
  }
  distance(r) { return Math.hypot(this.player.x-r.x,this.player.y-r.y); }

  gather(target) {
    if(this.paused) return;
    if(!target) { ui.message.textContent='Walk close to a tree or rock, then press E or click it.'; return; }
    if(this.distance(target)>REACH) { ui.message.textContent='A little closer! Walk up to it before gathering.'; return; }
    if(this.time.now-this.lastGather<300 || target.remaining<=0) return;
    this.lastGather=this.time.now;
    target.remaining--;
    this.supplies[target.kind]++;
    this.gathered.add(target.kind);
    ui[target.kind].textContent=this.supplies[target.kind];
    ui.message.textContent=this.gathered.size===2 ? 'Wood and stone. A lovely start for your future home.' : target.kind==='wood' ? 'A little wood, a little possibility. Try finding a rock next.' : 'Stone gathered! Find a tree for some wood, too.';
    const label=this.add.text(target.x,target.y-50,`+1 ${target.kind}`,{fontFamily:'monospace',fontSize:'13px',color:'#fff1c1',stroke:'#344d32',strokeThickness:3}).setOrigin(.5).setDepth(1002);
    this.tweens.add({targets:label,y:label.y-24,alpha:0,duration:850,onComplete:()=>label.destroy()});
    this.tweens.add({targets:target.image,angle:5,duration:60,yoyo:true,repeat:1});
    if(target.remaining===0) {
      target.image.setAlpha(.28).setScale(.55);
      this.time.delayedCall(18000,()=>{ target.remaining=target.kind==='wood'?3:2; target.image.setAlpha(1).setScale(1); });
    }
  }

  togglePause() {
    this.paused=!this.paused;
    this.pauseLabel.setVisible(this.paused);
    this.time.paused=this.paused;
    this.tweens.timeScale=this.paused?0:1;
    ui.pause.textContent=this.paused?'Resume · Esc':'Pause · Esc';
  }

  update(time,delta) {
    if(this.paused) return;
    const k=this.keys;
    let dx=Number(k.D.isDown||k.RIGHT.isDown)-Number(k.A.isDown||k.LEFT.isDown);
    let dy=Number(k.S.isDown||k.DOWN.isDown)-Number(k.W.isDown||k.UP.isDown);
    const length=Math.hypot(dx,dy)||1, step=Math.min(delta,40)*.13;
    const x=Phaser.Math.Clamp(this.player.x+dx/length*step,18,W-18);
    const y=Phaser.Math.Clamp(this.player.y+dy/length*step,44,H-10);
    const clear=(px,py)=>!this.resources.some(r=>r.remaining>0&&Math.hypot(px-r.x,py-r.y)<19) && !(px>31&&px<165&&py<78);
    if(clear(x,this.player.y)) this.player.x=x;
    if(clear(this.player.x,y)) this.player.y=y;
    this.player.setDepth(this.player.y);
    if(dx) this.player.setFlipX(dx<0);
    this.player.setAngle((dx||dy)?Math.sin(time/90)*3:0);
    this.glow.setAlpha(.6+Math.sin(time/270)*.25);
    this.fire.setScale(1,1+Math.sin(time/110)*.025);
    const near=this.nearest();
    this.cursor.clear();
    this.hint.setVisible(Boolean(near));
    if(near) {
      this.cursor.lineStyle(1,0xf0d999,.85).strokeEllipse(near.x,near.y-2,43,17);
      this.hint.setPosition(near.x,near.y-(near.kind==='wood'?82:42)).setText(`E · ${near.kind==='wood'?'Gather wood':'Gather stone'}`);
    }
  }
}

new Phaser.Game({
  type:Phaser.CANVAS, parent:'game', width:W, height:H, pixelArt:true,
  backgroundColor:'#78954f', banner:false, audio:{noAudio:true},
  scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},
  scene:[Clearing]
});
