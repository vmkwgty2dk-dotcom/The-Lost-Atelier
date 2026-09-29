(() => {
  'use strict';

  const VERSION = 5;
  const SAVE_KEY = 'lostAtelierSaveV3';
  const PREVIOUS_SAVE_KEY = 'lostAtelierSaveV2';
  const LEGACY_SAVE_KEY = 'lostAtelierSaveV1';
  const app = document.getElementById('app');
  const toastRoot = document.getElementById('toast-root');

  const ICONS = ['✦','☾','❖','✧','♜','⚗','✿','⌛','🜁','🜂','🜃','🜄'];
  const INGREDIENTS = ['Moon Iris','Silver Moss','Rose Ember','Star Anise','Night Dew','Pearl Resin','Blue Fig','Amber Leaf','Violet Smoke','Glass Mint'];
  const LOCK_SIGILS = ['☾','✦','❖','✿'];

  const WORLDS = [
    {id:1,name:'The Abandoned Atrium',short:'Atrium',subtitle:'Where the atelier remembers your name.',emoji:'✧',theme:'atrium',story:'The key warms in your palm. Dust lifts from the floor as if the house has been waiting.',scene:'A ruined glass atrium wakes beneath a storm of blue dust.'},
    {id:2,name:'Moon Garden',short:'Garden',subtitle:'Plants that bloom only under forgotten skies.',emoji:'☾',theme:'garden',story:'Every flower points toward a moon that should not exist.',scene:'Silver vines climb impossible arches beneath a second moon.'},
    {id:3,name:"Perfumer’s Vault",short:'Vault',subtitle:'Bottle memories before they disappear.',emoji:'⚗',theme:'perfume',story:'A sealed perfume contains a memory that belongs to someone else.',scene:'Crystal vials glow like captured weather inside a sealed vault.'},
    {id:4,name:'Celestial Wardrobe',short:'Wardrobe',subtitle:'Stitch constellations into living cloth.',emoji:'✧',theme:'wardrobe',story:'The mirrors show outfits no one has made yet — and one silhouette standing behind you.',scene:'Mirrors, silk and living constellations fill a midnight dressing hall.'},
    {id:5,name:'Clockwork Hall',short:'Clockwork',subtitle:'Time has been dismantled piece by piece.',emoji:'⌛',theme:'clockwork',story:'Every clock is stopped at the exact same minute.',scene:'Brass planets orbit a hall where every clock reads 1:13.'},
    {id:6,name:'Forbidden Library',short:'Library',subtitle:'Read the history someone tried to erase.',emoji:'❖',theme:'library',story:'Your name appears in a book written a century before you were born.',scene:'Endless shelves bend toward a black-glass archive at the center.'}
  ];

  const WORLD_RELIC_NAMES = [
    ['Dustglass Shard','Founder’s Signet','Whisper Key','Bluefire Lens','Portrait Locket','Atrium Compass','Glasswing Pin','Veiled Crest','First Door Seal'],
    ['Moonseed Pearl','Silver Thorn','Night Fountain Drop','Twin-Shadow Leaf','Lunar Bell','Gardener’s Token','False-Moon Petal','Root Map','Garden Seal'],
    ['Bottle XIII Stopper','Rain Memory','Blank Label','Amber Warning','Perfumer’s Coin','Scent Ledger','Breathglass Vial','Three-Era Formula','Vault Seal'],
    ['Star Thread Spool','Living Needle','Ghost Hem','Mirror Stitch','Silk Compass','Hidden Seam','Midnight Brooch','Founder’s Cuff','Wardrobe Seal'],
    ['Minute XIII Gear','Brass Heart Pin','Reverse Spring','Silent Cog','Second Shard','Watchmaker Note','Door Minute Key','Last Chime Bell','Clockwork Seal'],
    ['Untitled Bookmark','Vanishing Inkstone','Erased Family Crest','Page 404 Fragment','Archive Eye','Older Nameplate','Sealed Chapter','Witness Quill','Library Seal']
  ];
  const RELIC_EMOJIS = Array.from({length:54},(_,i)=>['◈','✦','☾','◇','✧','♜','❖','✿','⌘'][i%9]);

  const RELICS = (() => {
    const out=[];
    let idx=0;
    for(let w=0;w<6;w++){
      for(let i=0;i<9;i++){
        const rarity=i<=2?'Common':i<=5?'Rare':i<=7?'Epic':'Legendary';
        out.push({
          id:`r${idx+1}`,
          world:w+1,
          emoji:RELIC_EMOJIS[idx],
          name:WORLD_RELIC_NAMES[w][i],
          rarity,
          lore:`Recovered from ${WORLDS[w].name}. ${['It hums with a small memory the atelier refused to lose.','Its surface changes when another relic is brought near.','A hidden mark suggests it belonged to the erased founders.','Luma reacts to it before you touch it.'][i%4]}`
        });
        idx++;
      }
    }
    return out;
  })();

  const ACHIEVEMENTS = [
    {id:'first',icon:'✧',name:'The First Spark',desc:'Complete your first level.',test:s=>countCompleted(s)>=1},
    {id:'perfect',icon:'◈',name:'Flawless Hand',desc:'Earn a perfect clear.',test:s=>s.stats.perfects>=1},
    {id:'ten',icon:'✧',name:'Keeper of Ten',desc:'Complete 10 levels.',test:s=>countCompleted(s)>=10},
    {id:'stars30',icon:'✦',name:'Star Collector',desc:'Earn 30 total stars.',test:s=>totalStars(s)>=30},
    {id:'stars90',icon:'✶',name:'Constellation Keeper',desc:'Earn 90 total stars.',test:s=>totalStars(s)>=90},
    {id:'relic10',icon:'◈',name:'Curator',desc:'Recover 10 relics.',test:s=>s.relics.length>=10},
    {id:'relic36',icon:'◉',name:'Archivist',desc:'Recover 36 relics.',test:s=>s.relics.length>=36},
    {id:'combo8',icon:'⌁',name:'Unbroken Thread',desc:'Reach an 8x combo.',test:s=>s.stats.bestCombo>=8},
    {id:'boss3',icon:'♛',name:'Riftbreaker',desc:'Seal three world rifts.',test:s=>[10,20,30].every(n=>s.completed[n])},
    {id:'rank10',icon:'✧',name:'Witness Rank X',desc:'Reach player rank 10.',test:s=>s.rank>=10},
    {id:'world6',icon:'❖',name:'The Last Door',desc:'Reach the Forbidden Library.',test:s=>s.unlockedLevel>=51},
    {id:'secrets',icon:'⌑',name:'Behind Every Wall',desc:'Discover all six hidden chambers.',test:s=>(s.secrets||[]).length>=6},
    {id:'master',icon:'◉',name:'Atelier Master',desc:'Complete all 60 levels.',test:s=>countCompleted(s)>=60}
  ];

  const CHAPTER_TITLES = [
    ['The Warm Key','Dust That Breathes','The Bird in the Wall','A Name Under Glass','The First Relic','Footsteps Above','The Locked Portrait','A Door of Blue Fire','The Missing Founder','Atrium Rift'],
    ['Moonseed','Garden of Two Shadows','The Sleeping Fountain','Thorns of Silver','The Second Relic','A Flower Remembers','The Night Gardener','The False Moon','Roots Under Stone','Lunar Rift'],
    ['Bottle No. 13','Scent of Rain','The Empty Label','A Memory Distilled','The Third Relic','Amber Warning','The Perfumer’s Ledger','Breath in the Vault','The Unfinished Formula','Perfumer Rift'],
    ['Thread of Stars','The Moving Mannequin','Dress for a Ghost','Mirror Stitch','The Fourth Relic','The Hidden Seam','Silhouette at Midnight','Constellation Silk','The Founder’s Coat','Wardrobe Rift'],
    ['Minute Thirteen','Brass Heart','The Backward Clock','Gear of Silence','The Fifth Relic','A Second Stolen','The Watchmaker’s Note','Time Behind the Door','The Last Chime','Clockwork Rift'],
    ['Book Without a Title','Ink That Vanishes','The Erased Family','Page 404','The Sixth Relic','The Name Before Yours','The Sealed Chapter','History Rewrites Itself','The Atelier Chose You','The Heart of the Atelier']
  ];

  const STORY_BEATS = [
    ['The key turns by itself.','Dust rises in a spiral and forms a map.','A luminous bird watches from inside the wallpaper.','Your name is etched beneath a century-old mirror.','The first relic pulses when you touch it.','Someone walks across the floor above you.','A portrait has been painted over — except for the eyes.','A door appears only when the lights go out.','The founder’s signature matches your handwriting.','The atrium opens a rift that whispers your name.'],
    ['A seed blooms in your palm under moonlight.','Every plant casts two shadows.','The fountain runs upward for seven seconds.','Silver thorns spell a warning in an unknown script.','The garden gives up another piece of the erased past.','One flower repeats a sentence you have not spoken yet.','A second set of footprints circles your own.','The moon above the greenhouse is not the real moon.','Roots lead toward a chamber beneath the atelier.','The garden rift reveals a path deeper inside.'],
    ['Bottle thirteen is warm, though the vault is freezing.','A perfume recreates rain from a place you have never visited.','The blank label darkens when held near your hand.','A stranger’s childhood memory spills into the room.','Another relic unlocks a sealed cabinet.','Amber smoke writes a single word: RUN.','The ledger lists a final customer with your surname.','A breath fogs the inside of a bottle from within.','The missing formula is written across three eras.','The vault rift seals, leaving behind a familiar scent.'],
    ['Golden thread moves like a living constellation.','A mannequin turns its head when you look away.','A dress is tailored to measurements that match yours exactly.','The mirror sews one stitch before your hand moves.','The wardrobe releases a relic hidden in its lining.','A hidden seam opens into a room behind the mirrors.','The silhouette finally raises a hand — in warning.','Constellation silk reveals a map when placed under starlight.','The founder’s coat contains a key identical to yours.','The wardrobe rift opens onto a memory of the atelier alive.'],
    ['Every clock stops at 1:13.','A brass mechanism beats like a heart.','One clock counts backward toward an unknown event.','The missing gear is engraved with your initials.','A relic falls from a clock that has no opening.','For one second, the entire room becomes brand new.','The watchmaker’s note says the atelier was deliberately erased.','A hidden door exists for exactly one minute each cycle.','The final chime is heard from inside the walls.','The clockwork rift shows the moment history was changed.'],
    ['A book opens to a page that did not exist yesterday.','The ink disappears as soon as you understand it.','An entire family has been removed from every record.','Page 404 contains a drawing of the atelier heart.','The library yields the final outer relic.','A name older than the atelier matches yours.','The sealed chapter explains why the house could not be destroyed.','As you read, earlier pages rewrite themselves.','The atelier did not choose an heir — it chose a witness.','The heart awakens. The erased history returns, but one door remains locked.']
  ];

  const GAMEPLAY_META = {
    restore:{icon:'◇',name:'Fragment Restoration',desc:'Awaken every fragment before the memory collapses.'},
    sequence:{icon:'⌁',name:'Living Rune Chain',desc:'Read the rune order and keep a clean combo.'},
    mix:{icon:'⚗',name:'Memory Distillation',desc:'Rebuild a perfume formula from its surviving notes.'},
    hidden:{icon:'◈',name:'Hidden Sigils',desc:'Search the scene for only the marked symbols.'},
    memory:{icon:'✦',name:'Luma Echo',desc:'Watch Luma pulse a sequence, then repeat it perfectly.'},
    lock:{icon:'☾',name:'Impossible Lock',desc:'Rotate each ring until the live code matches the seal.'},
    pairs:{icon:'✧',name:'Mirror Pairs',desc:'Expose matching reflections without shattering focus.'},
    constellation:{icon:'✶',name:'Constellation Trace',desc:'Follow the celestial route and draw the lost pattern.'}
  };

  const WORLD_LEVEL_TYPES = [
    ['restore','sequence','hidden','memory','pairs','lock','constellation','mix','restore'],
    ['hidden','constellation','memory','restore','pairs','sequence','lock','hidden','mix'],
    ['mix','hidden','lock','memory','restore','constellation','pairs','mix','sequence'],
    ['pairs','sequence','constellation','restore','memory','hidden','lock','pairs','mix'],
    ['lock','sequence','memory','constellation','pairs','restore','hidden','lock','sequence'],
    ['memory','hidden','pairs','lock','constellation','mix','sequence','restore','memory']
  ];

  const BOSS_TYPES = [
    ['restore','sequence','constellation','lock'],
    ['hidden','memory','pairs','constellation'],
    ['mix','lock','hidden','memory'],
    ['pairs','constellation','restore','lock'],
    ['lock','memory','sequence','constellation'],
    ['memory','mix','pairs','lock']
  ];

  const SECRET_ROOMS = [
    {name:'The Room Between Walls',symbol:'◈',lore:'Behind the atrium portrait is a narrow room containing a second floor plan — one room is drawn outside the building.'},
    {name:'The Moonwell',symbol:'☾',lore:'Beneath the greenhouse is a well reflecting a sky from another season. Luma refuses to touch the water.'},
    {name:'The Unbottled Memory',symbol:'⚗',lore:'One shelf holds an empty space labeled with your name. The scent around it is the same as the key.'},
    {name:'The Mirror Dressing Room',symbol:'✧',lore:'A hidden mirror shows the atelier fully restored — but your reflection is missing from the scene.'},
    {name:'The Minute Zero Workshop',symbol:'⌛',lore:'A workshop appears between 1:12 and 1:13. Its tools are still warm, as though someone just left.'},
    {name:'The Black Archive',symbol:'📖',lore:'A sealed cabinet contains records that history could not rewrite. The final page is still blank.'}
  ];

  function makeLevels(){
    const out=[];
    for(let n=1;n<=60;n++){
      const world=Math.ceil(n/10), within=((n-1)%10)+1, boss=within===10;
      const difficulty=Math.min(10,1+Math.floor((n-1)/6));
      const type=boss?'boss':WORLD_LEVEL_TYPES[world-1][within-1];
      const targetTime=Math.max(24,54-difficulty*2);
      const mistakeLimit=boss?5:Math.max(3,5-Math.floor(difficulty/4));
      const timeLimit=boss?Math.max(105,targetTime*4):Math.max(48,targetTime*2+8);
      const meta=GAMEPLAY_META[type]||{name:'Rift Trial',desc:'Seal four linked memories.'};
      out.push({
        n,world,within,boss,type,difficulty,
        title:CHAPTER_TITLES[world-1][within-1],
        storyBeat:STORY_BEATS[world-1][within-1],
        subtitle:boss?'Seal the rift through four linked trials.':meta.desc,
        targetTime,mistakeLimit,timeLimit,
        modifier:n>=13&&!boss?['Unstable Light','Fading Ink','Echo Pressure','Glass Silence'][(n+world)%4]:'Clear Memory'
      });
    }
    return out;
  }
  const LEVELS=makeLevels();

  const defaultState=()=>({
    version:VERSION,
    cinematicSeen:false,
    xp:0,rank:1,coins:250,gems:12,unlockedLevel:1,
    stars:{},bestScores:{},completed:{},relics:[],achievements:{},dailyClaimDate:null,dailyStreak:0,
    settings:{sound:true,haptics:true,music:false,reducedMotion:false},
    companionLevel:0,restoration:0,
    avatar:{style:0,outfit:0},ownedOutfits:[0],
    boosters:{hint:3,ward:2,chrono:2},
    stats:{levelsPlayed:0,perfects:0,bestCombo:0,totalScore:0,totalMistakes:0,revives:0},secrets:[],
    missionDate:null,missions:[],weekKey:null,weeklyStars:0,weeklyClaimed:false,
    lastScreen:'home'
  });

  let state=loadState();
  let runtime=null;
  let levelInterval=null;
  let audioCtx=null;
  let musicNodes=null;

  function loadState(){
    try{
      const raw=JSON.parse(localStorage.getItem(SAVE_KEY));
      // V4 saved in the same key: upgrade it instead of discarding player progress.
      if(raw&&Number(raw.version)>=3&&Number(raw.version)<=VERSION){
        const upgraded=mergeState(raw);
        if(raw.version!==VERSION)localStorage.setItem(SAVE_KEY,JSON.stringify(upgraded));
        return upgraded;
      }
      const previous=JSON.parse(localStorage.getItem(PREVIOUS_SAVE_KEY));
      if(previous){
        const migrated=mergeState({...previous,version:VERSION});
        migrated.ownedOutfits=Array.isArray(previous.ownedOutfits)?previous.ownedOutfits:[0];
        localStorage.setItem(SAVE_KEY,JSON.stringify(migrated));
        return migrated;
      }
      const legacy=JSON.parse(localStorage.getItem(LEGACY_SAVE_KEY));
      if(legacy){
        const migrated=defaultState();
        Object.assign(migrated,legacy,{version:VERSION,cinematicSeen:true});
        migrated.settings={...defaultState().settings,...legacy.settings};
        migrated.stats={...defaultState().stats};
        migrated.avatar={...defaultState().avatar};
        migrated.boosters={...defaultState().boosters};
        migrated.ownedOutfits=[0];
        migrated.relics=[];
        Object.keys(legacy.completed||{}).filter(k=>legacy.completed[k]).forEach(k=>unlockRelicForLevel(+k,migrated,false));
        migrated.restoration=calcRestoration(migrated);
        localStorage.setItem(SAVE_KEY,JSON.stringify(migrated));
        return migrated;
      }
    }catch(_){ }
    return defaultState();
  }
  function mergeState(raw){
    const d=defaultState();
    const merged={...d,...raw,version:VERSION,settings:{...d.settings,...raw.settings},avatar:{...d.avatar,...raw.avatar},boosters:{...d.boosters,...raw.boosters},stats:{...d.stats,...raw.stats}};
    merged.ownedOutfits=Array.isArray(raw.ownedOutfits)?[...new Set([0,...raw.ownedOutfits])]:[0];
    return merged;
  }
  function saveState(){ try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch(_){ } }
  function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
  function sample(a,n){return shuffle(a).slice(0,Math.min(n,a.length));}
  function today(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function dayDelta(a,b){if(!a||!b)return 99;const A=new Date(a+'T12:00:00'),B=new Date(b+'T12:00:00');return Math.round((B-A)/86400000);}
  function weekKey(){const d=new Date();const y=d.getUTCFullYear();const one=new Date(Date.UTC(y,0,1));const day=Math.floor((d-one)/86400000);return `${y}-W${Math.floor((day+one.getUTCDay())/7)+1}`;}
  function countCompleted(s=state){return Object.keys(s.completed||{}).filter(k=>s.completed[k]).length;}
  function totalStars(s=state){return Object.values(s.stars||{}).reduce((a,b)=>a+(+b||0),0);}
  function rankFromXP(xp){return 1+Math.floor(Math.sqrt(xp/110));}
  function worldForLevel(n){return WORLDS[Math.min(5,Math.floor((Math.max(1,n)-1)/10))];}
  function levelByN(n){return LEVELS[n-1];}
  function calcRestoration(s=state){return Math.min(100,Math.round((countCompleted(s)/60)*78+(totalStars(s)/180)*22));}
  function restorationStage(){return Math.min(5,Math.floor(state.restoration/20));}
  function relicForLevel(n){if(n%10===0)return null;const world=Math.ceil(n/10),within=((n-1)%10)+1;return RELICS[(world-1)*9+(within-1)];}

  function vibrate(ms=25){if(state.settings.haptics&&navigator.vibrate)navigator.vibrate(ms);}
  function ensureAudio(){
    try{audioCtx ||= new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx;}catch(_){return null;}
  }
  function sound(kind='tap'){
    if(!state.settings.sound)return;
    const ctx=ensureAudio();if(!ctx)return;
    try{
      const o=ctx.createOscillator(),g=ctx.createGain(),t=ctx.currentTime;
      const map={tap:[430,.035],good:[690,.07],bad:[155,.09],win:[880,.20],relic:[1060,.25],cinematic:[520,.45],combo:[780,.05]};
      const [f,d]=map[kind]||map.tap;o.type=kind==='bad'?'sawtooth':'sine';o.frequency.setValueAtTime(f,t);
      if(kind==='win'||kind==='relic')o.frequency.exponentialRampToValueAtTime(f*1.45,t+d);
      g.gain.setValueAtTime(.045,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+d);
    }catch(_){ }
    if(state.settings.music)startMusic();
  }
  function startMusic(){
    if(musicNodes||!state.settings.music)return;
    const ctx=ensureAudio();if(!ctx)return;
    try{
      const gain=ctx.createGain();gain.gain.value=.006;gain.connect(ctx.destination);
      const a=ctx.createOscillator(),b=ctx.createOscillator();a.type='sine';b.type='triangle';a.frequency.value=110;b.frequency.value=164.81;a.connect(gain);b.connect(gain);a.start();b.start();musicNodes={a,b,gain};
    }catch(_){ }
  }
  function stopMusic(){if(!musicNodes)return;try{musicNodes.a.stop();musicNodes.b.stop();musicNodes.gain.disconnect();}catch(_){ }musicNodes=null;}
  let lastBurst=0;
  function sparkleBurst(anchor){
    if(state.settings.reducedMotion)return;
    const stamp=performance.now();if(stamp-lastBurst<80)return;lastBurst=stamp;
    const board=document.querySelector('.relic-scene,.rune-board,.explore-board,.constellation-board,.game-panel');
    const rect=(anchor||board)?.getBoundingClientRect();if(!rect)return;
    const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
    for(let i=0;i<7;i++){
      const dot=document.createElement('i');dot.className='touch-spark';dot.style.left=cx+'px';dot.style.top=cy+'px';
      dot.style.setProperty('--dx',Math.cos(i*Math.PI*2/7)*(25+Math.random()*33)+'px');
      dot.style.setProperty('--dy',Math.sin(i*Math.PI*2/7)*(25+Math.random()*33)+'px');
      document.body.appendChild(dot);dot.addEventListener('animationend',()=>dot.remove(),{once:true});
    }
  }
  function toast(msg,type='good'){
    const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=msg;toastRoot.appendChild(el);setTimeout(()=>el.remove(),2600);
  }

  function ensureMissions(){
    const t=today();
    if(state.missionDate!==t){
      state.missionDate=t;
      state.missions=[
        {id:'levels',label:'Complete 2 levels',target:2,progress:0,rewardCoins:140,rewardGems:0,claimed:false},
        {id:'stars',label:'Earn 5 stars',target:5,progress:0,rewardCoins:180,rewardGems:1,claimed:false},
        {id:'score',label:'Earn 2,500 score',target:2500,progress:0,rewardCoins:220,rewardGems:1,claimed:false}
      ];
    }
    const wk=weekKey();
    if(state.weekKey!==wk){state.weekKey=wk;state.weeklyStars=0;state.weeklyClaimed=false;}
    saveState();
  }
  function updateMissions(stars,score){
    ensureMissions();
    state.missions.forEach(m=>{
      if(m.id==='levels')m.progress=Math.min(m.target,m.progress+1);
      if(m.id==='stars')m.progress=Math.min(m.target,m.progress+stars);
      if(m.id==='score')m.progress=Math.min(m.target,m.progress+score);
    });
    state.weeklyStars+=stars;saveState();
  }
  function claimMission(id){
    ensureMissions();const m=state.missions.find(x=>x.id===id);if(!m||m.claimed||m.progress<m.target)return;
    m.claimed=true;state.coins+=m.rewardCoins;state.gems+=m.rewardGems;sound('relic');toast(`Mission claimed: +${m.rewardCoins} coins${m.rewardGems?`, +${m.rewardGems} gem`:''}`);saveState();renderHome();
  }
  function claimWeekly(){
    ensureMissions();if(state.weeklyClaimed||state.weeklyStars<20)return;
    state.weeklyClaimed=true;state.coins+=700;state.gems+=5;state.boosters.hint+=2;state.boosters.ward+=1;sound('relic');toast('Weekly chest opened: +700 coins, +5 gems, boosters.');saveState();renderHome();
  }

  function hud(){return `<div class="hud"><button class="pill currency-pill" data-go="shop" aria-label="Open Atelier Exchange">◈ ${state.coins}</button><button class="pill currency-pill" data-go="shop" aria-label="Open Atelier Exchange">✧ ${state.gems}</button><span class="pill rank-pill">R${state.rank}</span></div>`;}
  function nav(active){
    return `<div class="navbar">
      <button class="nav-btn ${active==='home'?'active':''}" data-go="home"><b>⌂</b><span>Home</span></button>
      <button class="nav-btn ${active==='worlds'?'active':''}" data-go="worlds"><b>✦</b><span>Worlds</span></button>
      <button class="nav-btn ${active==='vault'?'active':''}" data-go="vault"><b>◇</b><span>Vault</span></button>
      <button class="nav-btn ${active==='atelier'?'active':''}" data-go="atelier"><b>♙</b><span>Atelier</span></button>
      <button class="nav-btn ${active==='achievements'?'active':''}" data-go="achievements"><b>♛</b><span>Badges</span></button>
    </div>`;
  }
  function screenShell(content,active='home',back=false){
    return `<main class="screen"><div class="topbar"><div class="topbar-left">${back?'<button class="icon-btn" data-back="1" aria-label="Back">←</button>':''}<div><div class="brand">The Lost Atelier</div><div class="micro">THE ERASED HOUSE · VOL. I</div></div></div>${hud()}</div>${content}${nav(active)}</main>`;
  }
  // Screen-level DOM replacement: always return to the top on navigation.
  // Puzzle panel-only renders do not trigger this observer.
  new MutationObserver(changes=>{
    if(changes.some(m=>m.target===app&&m.addedNodes.length)){
      try{window.scrollTo({top:0,behavior:'instant'});}catch(_){window.scrollTo(0,0);}
    }
  }).observe(app,{childList:true});
  function sceneArt(worldId=1,compact=false){
    const w=WORLDS[worldId-1];
    return `<div class="scene ${w.theme} ${compact?'compact':''} stage-${restorationStage()}">
      <img class="scene-background" src="./world-${worldId}.svg" alt="" aria-hidden="true" />
      <div class="scene-vignette"></div><div class="sky-stars"></div><div class="floor-glow"></div>
      <div class="world-crest"><span>✦</span><i>${String(worldId).padStart(2,'0')}</i></div>
      <img class="illustrated-character avatar-style-${state.avatar.style} outfit-style-${state.avatar.outfit}" src="./character.svg" alt="" aria-hidden="true" />
      <img class="illustrated-luma" src="./luma.svg" alt="" aria-hidden="true" />
      <div class="ambient-motes"><i></i><i></i><i></i><i></i><i></i></div><div class="scene-sigil" aria-hidden="true"><span>✧</span></div>
      ${restorationStage()>=2?'<div class="restored-vine v1">❧</div>':''}${restorationStage()>=4?'<div class="restored-vine v2">❦</div>':''}
    </div>`;
  }

  function renderCinematic(step=0){
    cleanupRuntime();
    const scenes=[
      {k:'THE LETTER',title:'It arrived without a sender.',text:'Inside was a key, a torn map, and one sentence: “Return what the world forgot.”',symbol:'✉'},
      {k:'THE DOOR',title:'The alley ended where the map began.',text:'A blue door appeared between two buildings that had never left a gap.',symbol:'✧'},
      {k:'THE ATELIER',title:'The house remembered you first.',text:'Dust rose. Mirrors lit. Somewhere above, a tiny luminous bird opened its eyes.',symbol:'✦'},
      {k:'THE PROMISE',title:'Sixty memories. Six sealed worlds.',text:'Restore the atelier, recover its relics, and discover why your name was erased with it.',symbol:'✦'}
    ];
    const s=scenes[step];
    app.innerHTML=`<main class="cinematic"><div class="cinematic-art c${step}"><div class="cinematic-scene" style="background-image:url(./world-${[1,1,2,6][step]}.svg)"></div><div class="cinematic-symbol">${s.symbol}</div><div class="cinematic-rings"></div></div><div class="cinematic-copy"><div class="kicker">${s.k}</div><h1>${s.title}</h1><p>${s.text}</p><div class="cinematic-dots">${scenes.map((_,i)=>`<i class="${i===step?'on':''}"></i>`).join('')}</div><button class="primary cinematic-next">${step===scenes.length-1?'Begin your story':'Continue'}</button><button class="text-btn cinematic-skip">Skip intro</button></div></main>`;
    sound('cinematic');
    document.querySelector('.cinematic-next').addEventListener('click',()=>{
      sound();if(step<scenes.length-1)renderCinematic(step+1);else{state.cinematicSeen=true;saveState();renderHome();}
    });
    document.querySelector('.cinematic-skip').addEventListener('click',()=>{state.cinematicSeen=true;saveState();renderHome();});
  }

  function renderHome(){
    cleanupRuntime();ensureMissions();state.lastScreen='home';state.restoration=calcRestoration();saveState();
    const next=Math.min(60,state.unlockedLevel),w=worldForLevel(next),progress=Math.round(countCompleted()/60*100),daily=state.dailyClaimDate!==today();
    const dailyDay=((state.dailyStreak||0)%7)+1;
    const missions=state.missions.map(m=>`<div class="mission"><div><strong>${m.label}</strong><small>${m.progress}/${m.target}</small></div><div class="mission-track"><i style="width:${Math.min(100,m.progress/m.target*100)}%"></i></div>${m.claimed?'<span class="mission-done">✓</span>':m.progress>=m.target?`<button class="mini-btn" data-mission="${m.id}">Claim</button>`:'<span class="mission-reward">+'+m.rewardCoins+' ◈</span>'}</div>`).join('');
    const xpFloor=(state.rank-1)*(state.rank-1)*110,xpCeil=state.rank*state.rank*110,xpPct=Math.min(100,Math.max(0,(state.xp-xpFloor)/(xpCeil-xpFloor)*100));
    app.innerHTML=screenShell(`
      <section class="home-hero">${sceneArt(w.id)}<div class="hero-overlay"><div class="hero-crest" aria-hidden="true">✧ <span>VOLUME I · THE ERASED HOUSE</span> ✧</div><div class="kicker">AN IMMERSIVE PUZZLE MYSTERY</div><h1>The Lost<br><em>Atelier</em></h1><p>${w.scene}</p><div class="hero-progress"><span>YOUR STORY</span><span>${Math.round(countCompleted()/60*100)}% FOUND</span><div class="progress"><i style="width:${Math.round(countCompleted()/60*100)}%"></i></div></div><button class="primary hero-play" data-play="${next}">${state.unlockedLevel>60?'Replay the Finale':`Open memory ${next}`}</button><button class="hero-map" data-go="worlds">Enter the six worlds</button></div></section>
      <div class="stat-strip"><div><b>${state.restoration}%</b><span>Restored</span></div><div><b>${totalStars()}/180</b><span>Stars</span></div><div><b>${state.relics.length}/54</b><span>Relics</span></div><div><b>${state.stats.perfects}</b><span>Perfects</span></div></div>
      <section class="mastery-card"><div class="mastery-seal">R${state.rank}</div><div class="mastery-copy"><span class="eyebrow">WITNESS MASTERY</span><strong>${state.rank<5?'Apprentice Witness':state.rank<10?'Memory Keeper':state.rank<15?'Rift Warden':'Atelier Master'}</strong><small>${Math.max(0,xpCeil-state.xp)} XP to Rank ${state.rank+1}</small><div class="progress"><i style="width:${xpPct}%"></i></div></div><button class="mini-btn" data-go="shop">Exchange</button></section>
      <div class="quick-actions"><button data-go="shop"><span>✦</span><b>Atelier Exchange</b><small>Boosters & wardrobe</small></button><button data-go="vault"><span>◇</span><b>Relic Vault</b><small>${state.relics.length}/54 recovered</small></button></div>
      <div class="section-title"><div><span class="eyebrow">TODAY IN THE ATELIER</span><h2>Daily objectives</h2></div><span>${daily?`Streak day ${dailyDay}`:'Gift claimed'}</span></div>
      <div class="daily-grid"><button class="daily-card ${daily?'ready':''}" data-daily="1"><span>✉</span><div><strong>${daily?`Day ${dailyDay} parcel`:'Parcel opened'}</strong><small>${daily?'Keep the 7-day streak alive':'Return tomorrow for the next seal'}</small></div></button><button class="daily-card" data-go="atelier"><span>✧</span><div><strong>Luma Lv. ${state.companionLevel}</strong><small>Companion & wardrobe</small></div></button></div>
      <div class="mission-card">${missions}</div>
      <div class="weekly-card"><div><div class="kicker">WEEKLY RITUAL</div><strong>Collect 20 stars</strong><small>${state.weeklyStars}/20 stars • Grand chest</small></div><button class="mini-btn ${state.weeklyStars>=20&&!state.weeklyClaimed?'ready':''}" data-weekly="1" ${state.weeklyStars<20||state.weeklyClaimed?'disabled':''}>${state.weeklyClaimed?'Claimed':'Open'}</button></div>
      <div class="section-title"><div><span class="eyebrow">CURRENT CHAPTER</span><h2>${w.name}</h2></div><span>${progress}% story</span></div>
      <div class="chapter-card"><div class="chapter-number">${String(w.id).padStart(2,'0')}</div><div><strong>${esc(levelByN(next).title)}</strong><p>${esc(levelByN(next).storyBeat)}</p><div class="progress"><i style="width:${progress}%"></i></div></div></div>
    `,'home');
    bindCommon();
  }

  function renderWorlds(){
    cleanupRuntime();
    const cards=WORLDS.map(w=>{
      const start=(w.id-1)*10+1,completed=Array.from({length:10},(_,i)=>start+i).filter(n=>state.completed[n]).length;
      const levels=Array.from({length:10},(_,i)=>start+i).map(n=>{
        const locked=n>state.unlockedLevel,stars=state.stars[n]||0,boss=n%10===0;
        return `<button class="level-node ${locked?'locked':''} ${boss?'boss-node':''}" ${locked?'disabled':''} data-play="${n}"><span>${boss?'♛':n}</span><small>${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</small></button>`;
      }).join('');
      const secretOpen=completed>=8,secretFound=(state.secrets||[]).includes(w.id);return `<section class="world-panel ${w.theme} ${w.id>Math.ceil(state.unlockedLevel/10)?'world-locked':''}">${sceneArt(w.id,true)}<div class="world-copy"><div class="world-meta"><div><div class="kicker">WORLD ${w.id}</div><h3>${w.name}</h3><p>${w.subtitle}</p></div><b>${completed}/10</b></div><div class="progress"><i style="width:${completed*10}%"></i></div><div class="path-grid">${levels}</div>${secretOpen?`<button class="secret-door ${secretFound?'found':''}" data-secret="${w.id}"><span>${SECRET_ROOMS[w.id-1].symbol}</span><div><b>${secretFound?'Hidden chamber found':'A secret door has appeared'}</b><small>${secretFound?SECRET_ROOMS[w.id-1].name:'Open after restoring eight memories'}</small></div><i>${secretFound?'✓':'→'}</i></button>`:''}</div></section>`;
    }).join('');
    app.innerHTML=screenShell(`<div class="page-intro"><span class="eyebrow">SIX SEALED WORLDS</span><h1>World Map</h1><p>Each chapter has nine mystery stages and one four-part Rift Trial.</p></div>${cards}`,'worlds');bindCommon();
  }

  function renderVault(){
    cleanupRuntime();
    const rarityOrder=['Legendary','Epic','Rare','Common'];
    const filters=rarityOrder.map(r=>`<span class="rarity-chip ${r.toLowerCase()}">${r} ${state.relics.filter(id=>RELICS.find(x=>x.id===id)?.rarity===r).length}</span>`).join('');
    const relics=RELICS.map(r=>{
      const unlocked=state.relics.includes(r.id);
      return `<article class="relic-card ${unlocked?'':'locked'} rarity-${r.rarity.toLowerCase()}"><div class="relic-orb">${unlocked?r.emoji:'?'}</div><div class="relic-rarity">${unlocked?r.rarity:'Sealed'}</div><strong>${unlocked?esc(r.name):'Unknown Relic'}</strong><p>${unlocked?esc(r.lore):`Recover the missing memory in World ${r.world}.`}</p></article>`;
    }).join('');
    app.innerHTML=screenShell(`<div class="page-intro"><span class="eyebrow">54 MEMORY OBJECTS</span><h1>Relic Vault</h1><p>Every regular level hides one relic. Legendary pieces complete each world collection.</p></div><div class="rarity-row">${filters}</div><div class="relic-grid">${relics}</div>`,'vault');bindCommon();
  }

  function renderAtelier(){
    cleanupRuntime();state.restoration=calcRestoration();
    const outfits=['Witness Coat','Moonweave','Glassgarden','Celestial','Aurora Veil','Archive Noir'];
    const styles=['Ivory','Nocturne','Roseglass'];
    const rankNeed=[1,3,6,10,13,16];
    app.innerHTML=screenShell(`<div class="page-intro"><span class="eyebrow">YOUR LIVING BASE</span><h1>The Atelier</h1><p>It changes as you restore the story. Luma evolves, rooms awaken and your wardrobe grows.</p></div>
      <section class="atelier-stage">${sceneArt(Math.min(6,Math.ceil(Math.min(60,state.unlockedLevel)/10)))}<div class="atelier-progress"><b>${state.restoration}% restored</b><span>Stage ${restorationStage()+1}/6</span><div class="progress"><i style="width:${state.restoration}%"></i></div></div></section>
      <div class="section-title"><div><span class="eyebrow">WITNESS</span><h2>Character style</h2></div><span>Cosmetic</span></div>
      <div class="selector-row">${styles.map((x,i)=>`<button class="selector ${state.avatar.style===i?'selected':''}" data-avatar-style="${i}"><span class="mini-avatar avatar-${i}"></span><b>${x}</b></button>`).join('')}</div>
      <div class="section-title"><div><span class="eyebrow">WARDROBE</span><h2>Owned outfits</h2></div><button class="mini-btn" data-go="shop">Open Exchange</button></div>
      <div class="selector-row wardrobe-grid">${outfits.map((x,i)=>{const owned=(state.ownedOutfits||[]).includes(i),rankLocked=state.rank<rankNeed[i],locked=!owned||rankLocked;return `<button class="selector ${state.avatar.outfit===i?'selected':''} ${locked?'locked':''}" data-avatar-outfit="${i}" ${locked?'disabled':''}><span class="outfit-swatch o${i}"></span><b>${x}</b><small>${owned?(rankLocked?`Rank ${rankNeed[i]} required`:'Owned'):'Exchange unlock'}</small></button>`}).join('')}</div>
      <div class="companion-card"><div class="companion-orb">✦</div><div><div class="kicker">LUMA • COMPANION</div><h3>Evolution ${Math.min(6,state.companionLevel+1)}/6</h3><p>${state.companionLevel<5?'Luma evolves every ten levels and reveals more hidden details.':'Luma has reached full luminous form.'}</p></div></div>
      <div class="booster-card"><div><strong>Field kit</strong><small>Use boosters inside difficult memories.</small></div><div class="booster-pills"><span>✦ Hint ×${state.boosters.hint}</span><span>⬡ Ward ×${state.boosters.ward}</span><span>◷ Chrono ×${state.boosters.chrono}</span></div></div>
      <button class="secondary" data-go="settings">⚙ Game settings</button>
    `,'atelier');
    bindCommon();
    document.querySelectorAll('[data-avatar-style]').forEach(b=>b.addEventListener('click',()=>{state.avatar.style=+b.dataset.avatarStyle;saveState();sound();renderAtelier();}));
    document.querySelectorAll('[data-avatar-outfit]').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.avatarOutfit;if(!(state.ownedOutfits||[]).includes(i))return;state.avatar.outfit=i;saveState();sound();renderAtelier();}));
  }

  function renderShop(){
    cleanupRuntime();
    const outfitNames=['Moonweave','Glassgarden','Celestial','Aurora Veil','Archive Noir'];
    const outfitCosts=[6,10,14,18,24],rankNeed=[3,6,10,13,16];
    const boosters=[
      {id:'hint',icon:'✦',name:'Luma Hint',desc:'Highlights the next true move.',cost:180,currency:'coins'},
      {id:'ward',icon:'⬡',name:'Memory Ward',desc:'Absorbs one mistake without breaking combo.',cost:240,currency:'coins'},
      {id:'chrono',icon:'◷',name:'Chrono Thread',desc:'Rewinds ten seconds during a trial.',cost:260,currency:'coins'}
    ];
    const boosterCards=boosters.map(x=>`<article class="shop-card"><div class="shop-icon">${x.icon}</div><div><span class="eyebrow">FIELD TOOL</span><strong>${x.name}</strong><p>${x.desc}</p><small>Owned ×${state.boosters[x.id]}</small></div><button class="mini-btn" data-buy-booster="${x.id}" data-cost="${x.cost}">◈ ${x.cost}</button></article>`).join('');
    const outfits=outfitNames.map((name,j)=>{const i=j+1,owned=(state.ownedOutfits||[]).includes(i),rankLocked=state.rank<rankNeed[j];return `<article class="shop-card outfit-shop ${owned?'owned':''}"><span class="outfit-swatch o${i}"></span><div><span class="eyebrow">WARDROBE</span><strong>${name}</strong><p>${rankLocked?`Reach Rank ${rankNeed[j]} to attune this outfit.`:'Permanent cosmetic unlock.'}</p></div><button class="mini-btn" data-buy-outfit="${i}" data-cost="${outfitCosts[j]}" data-rank="${rankNeed[j]}" ${owned||rankLocked?'disabled':''}>${owned?'Owned':rankLocked?'Locked':`✧ ${outfitCosts[j]}`}</button></article>`}).join('');
    app.innerHTML=screenShell(`<div class="page-intro"><span class="eyebrow">ATELIER EXCHANGE</span><h1>Field Kit & Wardrobe</h1><p>Spend only earned in-game currency. No purchase is required to finish the story.</p></div><div class="wallet-card"><div><span>◈</span><b>${state.coins}</b><small>Coins</small></div><div><span>✧</span><b>${state.gems}</b><small>Gems</small></div><div><span>R</span><b>${state.rank}</b><small>Rank</small></div></div><div class="section-title"><div><span class="eyebrow">BOOSTERS</span><h2>Prepare for a rift</h2></div><span>Reusable</span></div><div class="shop-grid">${boosterCards}</div><button class="bundle-card" data-buy-bundle="1"><span>✦</span><div><strong>Master field bundle</strong><small>2 Hints • 1 Ward • 1 Chrono</small></div><b>◈ 700</b></button><div class="section-title"><div><span class="eyebrow">WARDROBE</span><h2>Rare witness attire</h2></div><span>Permanent</span></div><div class="shop-grid">${outfits}</div>`,'atelier');
    bindCommon();
    document.querySelectorAll('[data-buy-booster]').forEach(b=>b.addEventListener('click',()=>buyBooster(b.dataset.buyBooster,+b.dataset.cost)));
    document.querySelector('[data-buy-bundle]')?.addEventListener('click',buyBundle);
    document.querySelectorAll('[data-buy-outfit]').forEach(b=>b.addEventListener('click',()=>buyOutfit(+b.dataset.buyOutfit,+b.dataset.cost,+b.dataset.rank)));
  }
  function buyBooster(type,cost){if(state.coins<cost)return toast('Not enough coins yet.','bad');state.coins-=cost;state.boosters[type]++;saveState();sound('relic');toast('Field tool added to your kit.');renderShop();}
  function buyBundle(){if(state.coins<700)return toast('Not enough coins yet.','bad');state.coins-=700;state.boosters.hint+=2;state.boosters.ward++;state.boosters.chrono++;saveState();sound('relic');toast('Master field bundle opened.');renderShop();}
  function buyOutfit(i,cost,rankNeed){if(state.rank<rankNeed)return toast(`Reach Rank ${rankNeed} first.`,'bad');if((state.ownedOutfits||[]).includes(i))return;if(state.gems<cost)return toast('Not enough gems yet.','bad');state.gems-=cost;state.ownedOutfits??=[0];state.ownedOutfits.push(i);state.avatar.outfit=i;saveState();sound('relic');toast('New witness attire unlocked.');renderShop();}

  function renderAchievements(){
    cleanupRuntime();checkAchievements(false);
    const list=ACHIEVEMENTS.map(a=>{const unlocked=!!state.achievements[a.id];return `<div class="badge-card ${unlocked?'unlocked':'locked'}"><div class="badge-icon">${a.icon}</div><div><strong>${a.name}</strong><p>${a.desc}</p></div><span>${unlocked?'✓':'◇'}</span></div>`}).join('');
    app.innerHTML=screenShell(`<div class="page-intro"><span class="eyebrow">MASTER RECORD</span><h1>Achievements</h1><p>Long-term goals track mastery, collection, precision and progression.</p></div><div class="achievement-grid">${list}</div>`,'achievements');bindCommon();
  }

  function renderSettings(){
    cleanupRuntime();
    app.innerHTML=screenShell(`<div class="page-intro"><span class="eyebrow">PREFERENCES</span><h1>Settings</h1><p>Progress saves locally in this browser. Keep the same website address for future updates. Uninstalling or clearing browser storage can erase progress.</p></div><div class="settings-card">${settingRow('Sound effects','sound','UI, puzzle and reward sounds')}${settingRow('Ambient music','music','Low-volume atelier ambience')}${settingRow('Haptics','haptics','Supported Android devices')}${settingRow('Reduced motion','reducedMotion','Simpler transitions and effects')}</div><div class="danger-card"><strong>Progress data</strong><p>Reset removes all local progress, relics and rewards on this device.</p><button class="secondary" data-reset="1">Reset all progress</button></div><div class="build-note">Premium V5 Preview • 60 levels • 8 gameplay systems • 54 relics • offline PWA</div>`,'atelier',true);bindCommon();
  }
  function settingRow(label,key,desc){return `<div class="setting"><div><strong>${label}</strong><small>${desc}</small></div><button class="switch ${state.settings[key]?'on':''}" data-setting="${key}" aria-pressed="${state.settings[key]}"><i></i></button></div>`;}

  function renderLevel(n){
    if(n<1||n>60)n=60;
    if(n>state.unlockedLevel){toast('That memory is still sealed.','bad');return renderWorlds();}
    cleanupRuntime();
    const level=levelByN(n),world=worldForLevel(n);
    runtime={level,world,type:level.type,score:1000,bonus:0,elapsed:0,mistakes:0,combo:0,maxCombo:0,correctActions:0,totalActions:0,started:0,completed:false,failed:false,active:false,bossStage:level.boss?1:0,wardActive:false,paused:false,pausedAt:0,reviveUsed:false};
    app.innerHTML=`<main class="screen level-screen ${world.theme}"><div class="level-top"><button class="icon-btn" data-back-level="1" aria-label="Exit level">←</button><div class="level-title"><span>WORLD ${world.id} • LEVEL ${n}</span><strong>${esc(level.title)}</strong></div><button class="icon-btn" data-pause="1" aria-label="Pause">Ⅱ</button></div>
      <div class="level-hud"><div><b id="score">1000</b><span>SCORE</span></div><div><b id="combo">×1</b><span>COMBO</span></div><div><b id="timer">0/${level.timeLimit}s</b><span>TIME</span></div><div><b id="mistakes">0/${level.mistakeLimit}</b><span>STABILITY</span></div></div>
      <section class="level-scene">${sceneArt(world.id,true)}<div class="scene-caption"><span>✧ ${esc(world.short)} • ${esc(level.modifier)}</span><p>${esc(level.storyBeat)}</p></div></section>
      <div class="booster-bar"><button data-booster="hint" ${state.boosters.hint<=0?'disabled':''}>✦ <b>${state.boosters.hint}</b><span>Hint</span></button><button data-booster="ward" ${state.boosters.ward<=0?'disabled':''}>⬡ <b>${state.boosters.ward}</b><span>Ward</span></button><button data-booster="chrono" ${state.boosters.chrono<=0?'disabled':''}>◷ <b>${state.boosters.chrono}</b><span>Chrono</span></button></div>
      <section class="game-panel" id="game-panel"></section></main>`;
    document.querySelector('[data-back-level]').addEventListener('click',()=>{sound();confirmExitLevel();});
    document.querySelector('[data-pause]').addEventListener('click',showPause);
    document.querySelectorAll('[data-booster]').forEach(b=>b.addEventListener('click',()=>useBooster(b.dataset.booster)));
    renderLevelBriefing();
  }

  function renderLevelBriefing(){
    if(!runtime)return;
    const l=runtime.level,meta=l.boss?{icon:'♛',name:'Rift Trial',desc:'Four linked trials. Your stability carries across every stage.'}:GAMEPLAY_META[l.type];
    panel(`<div class="briefing"><div class="briefing-emblem">${meta.icon}</div><span class="eyebrow">${l.boss?'BOSS MEMORY':`LEVEL ${l.n} BRIEFING`}</span><h2>${esc(meta.name)}</h2><p>${esc(l.subtitle)}</p><div class="briefing-rules"><div><b>★★★</b><span>Clear with 0 mistakes before ${l.targetTime}s</span></div><div><b>★★</b><span>Keep stability above zero and finish cleanly</span></div><div><b>LIMIT</b><span>${l.timeLimit}s • ${l.mistakeLimit} stability breaks</span></div></div><div class="modifier-card"><span>ACTIVE MEMORY</span><b>${esc(l.modifier)}</b></div><button class="primary" data-begin-level="1">${l.boss?'Enter the Rift':'Begin Memory'}</button></div>`);
    document.querySelector('[data-begin-level]')?.addEventListener('click',beginChallenge);
  }

  function beginChallenge(){
    if(!runtime||runtime.active)return;runtime.active=true;runtime.started=Date.now();sound('cinematic');startClock();if(runtime.level.boss)renderBossStage();else renderMiniGame(runtime.level.type);window.scrollTo(0,0);
  }

  function pauseRuntime(){if(!runtime||runtime.paused||!runtime.active)return;runtime.paused=true;runtime.pausedAt=Date.now();if(runtime.type==='memory'&&runtime.inputLocked){runtime.memoryRound++;runtime.memoryNeedsReplay=true;}}
  function resumeRuntime(){if(!runtime||!runtime.paused)return;if(runtime.started&&runtime.pausedAt)runtime.started+=Date.now()-runtime.pausedAt;runtime.paused=false;runtime.pausedAt=0;if(runtime.memoryNeedsReplay&&runtime.playMemory){runtime.memoryNeedsReplay=false;runtime.playMemory();}}

  function showPause(){
    if(!runtime||runtime.completed||runtime.failed)return;pauseRuntime();
    const o=document.createElement('div');o.className='result pause-overlay';o.innerHTML=`<div class="result-card"><div class="kicker">PAUSED</div><h2>${esc(runtime.level.title)}</h2><p>Your current puzzle state is preserved.</p><div class="pause-stats"><span>Score <b>${runtime.score}</b></span><span>Stability <b>${runtime.mistakes}/${runtime.level.mistakeLimit}</b></span><span>Time <b>${runtime.elapsed}s</b></span></div><button class="primary" data-resume="1">Resume</button><button class="secondary" data-restart="1">Restart level</button><button class="text-btn" data-exit="1">Exit to map</button></div>`;document.body.appendChild(o);
    o.querySelector('[data-resume]').addEventListener('click',()=>{resumeRuntime();o.remove();});
    o.querySelector('[data-restart]').addEventListener('click',()=>{const n=runtime.level.n;o.remove();renderLevel(n);});
    o.querySelector('[data-exit]').addEventListener('click',()=>{o.remove();renderWorlds();});
  }
  function confirmExitLevel(){
    if(!runtime||runtime.completed)return renderWorlds();pauseRuntime();
    const o=document.createElement('div');o.className='result';o.innerHTML=`<div class="result-card"><div class="kicker">LEAVE MEMORY?</div><h2>Progress in this attempt will reset.</h2><button class="primary" data-stay="1">Keep playing</button><button class="secondary" data-leave="1">Exit to map</button></div>`;document.body.appendChild(o);
    o.querySelector('[data-stay]').addEventListener('click',()=>{resumeRuntime();o.remove();});o.querySelector('[data-leave]').addEventListener('click',()=>{o.remove();renderWorlds();});
  }

  function startClock(){
    if(levelInterval)clearInterval(levelInterval);
    levelInterval=setInterval(()=>{
      if(!runtime||runtime.completed||runtime.failed||runtime.paused||!runtime.active)return;
      runtime.elapsed=Math.floor((Date.now()-runtime.started)/1000);
      runtime.score=Math.max(100,1000-runtime.elapsed*6-runtime.mistakes*70+runtime.bonus+runtime.maxCombo*20);
      const t=document.getElementById('timer'),sc=document.getElementById('score');if(t)t.textContent=`${runtime.elapsed}/${runtime.level.timeLimit}s`;if(sc)sc.textContent=runtime.score;
      if(runtime.elapsed>=runtime.level.timeLimit)failLevel('The memory faded before it could be restored.');
    },250);
  }

  function refreshCombo(){const c=document.getElementById('combo');if(c)c.textContent=`×${Math.max(1,runtime.combo)}`;}
  function correctAction(points=35){
    if(!runtime||runtime.failed||runtime.completed||runtime.paused)return;runtime.correctActions++;runtime.totalActions++;runtime.combo++;runtime.maxCombo=Math.max(runtime.maxCombo,runtime.combo);runtime.bonus+=points+Math.min(140,runtime.combo*6);refreshCombo();sparkleBurst(document.querySelector('.ritual-heart,.rune-core,.constellation-glow,.game-panel'));if(runtime.combo>1)sound('combo');else sound('good');vibrate();
  }
  function registerMistake(msg='The atelier resists that move.'){
    if(!runtime||runtime.failed||runtime.completed||runtime.paused)return;runtime.totalActions++;
    if(runtime.wardActive){runtime.wardActive=false;toast('Ward absorbed the mistake.');sound('good');return;}
    runtime.mistakes++;runtime.combo=0;refreshCombo();const m=document.getElementById('mistakes');if(m)m.textContent=`${runtime.mistakes}/${runtime.level.mistakeLimit}`;sound('bad');vibrate(60);if(msg)toast(msg,'bad');
    if(runtime.mistakes>=runtime.level.mistakeLimit)failLevel('The memory fractured under too many unstable moves.');
  }
  function panel(html){const p=document.getElementById('game-panel');if(p)p.innerHTML=html;}
  function objective(title,desc,tag='MEMORY TASK'){return `<div class="objective"><span class="objective-tag">${tag}</span><h2>${esc(title)}</h2><p>${esc(desc)}</p></div>`;}
  function renderMiniGame(type){runtime.type=type;({restore:renderRestore,sequence:renderSequence,mix:renderMix,hidden:renderHidden,memory:renderMemory,lock:renderLock,pairs:renderPairs,constellation:renderConstellation}[type]||renderRestore)();}


// Handcrafted scene interactions; drag or tap a fragment to return it to the heart.
function renderRestore(){
  const count=Math.min(12,5+runtime.level.difficulty),items=shuffle(ICONS).slice(0,count);
  const spots=[[19,19],[80,18],[15,42],[83,45],[18,75],[80,77],[48,12],[50,87],[8,88],[92,88],[8,12],[92,12]];
  runtime.remaining=count;runtime.restoredCount=0;
  panel(`${objective('Awaken the broken heart','Touch the scattered fragments, or drag them into the glowing heart.','RELIC RESTORATION')}<div class="relic-scene" style="--room:url('./world-${runtime.world.id}.svg')"><div class="relic-scene-shade"></div><div class="ritual-heart"><span>✦</span><small>MEMORY CORE</small><strong id="ritual-progress">0 / ${count}</strong></div>${items.map((x,i)=>`<button class="scene-fragment" data-frag="${i}" style="--x:${spots[i][0]}%;--y:${spots[i][1]}%;--delay:${(i%4)*.31}s" aria-label="Restore fragment ${i+1}"><span>${x}</span></button>`).join('')}<div class="scene-instruction">TOUCH OR DRAG THE LUMINOUS PIECES</div></div>`);
  const collect=b=>{if(!runtime||runtime.failed||runtime.completed||b.classList.contains('done'))return;b.classList.add('done');correctAction(32);runtime.remaining--;runtime.restoredCount++;const progress=document.getElementById('ritual-progress');if(progress)progress.textContent=`${runtime.restoredCount} / ${count}`;const heart=document.querySelector('.ritual-heart');heart?.classList.remove('pulse');void heart?.offsetWidth;heart?.classList.add('pulse');if(runtime.remaining===0)finishCurrentChallenge();};
  document.querySelectorAll('[data-frag]').forEach(b=>{let moved=false,start=null;b.addEventListener('click',()=>{if(!moved)collect(b);});b.addEventListener('pointerdown',e=>{moved=false;start={x:e.clientX,y:e.clientY};try{b.setPointerCapture(e.pointerId);}catch(_){}});b.addEventListener('pointermove',e=>{if(!b.hasPointerCapture?.(e.pointerId)||!start)return;if(Math.hypot(e.clientX-start.x,e.clientY-start.y)<9&&!moved)return;moved=true;const rect=b.closest('.relic-scene').getBoundingClientRect();b.style.left=`${Math.max(6,Math.min(94,(e.clientX-rect.left)/rect.width*100))}%`;b.style.top=`${Math.max(7,Math.min(93,(e.clientY-rect.top)/rect.height*100))}%`;});b.addEventListener('pointerup',e=>{if(!moved)return;const area=document.querySelector('.ritual-heart')?.getBoundingClientRect();if(area&&e.clientX>=area.left-20&&e.clientX<=area.right+20&&e.clientY>=area.top-20&&e.clientY<=area.bottom+20)collect(b);else{b.style.left='';b.style.top='';}});b.addEventListener('pointercancel',()=>{b.style.left='';b.style.top='';});});
}

  function renderSequence(){
    const len=Math.min(12,5+runtime.level.difficulty);runtime.next=1;runtime.runePoints=[];
    const nums=shuffle(Array.from({length:len},(_,i)=>i+1));
    const slots=[[25,24],[50,15],[75,24],[84,42],[75,69],[50,83],[25,69],[16,42],[38,35],[62,35],[38,61],[62,61]];
    panel(`${objective('Wake the rune constellation','Follow the numbered seals in ascending order to restore the golden thread.','LIVING RUNE CHAIN')}<div class="rune-counter"><span>CHARGING THE SEAL</span><b id="rune-count">0 / ${len}</b></div><div class="rune-board"><svg id="rune-lines" viewBox="0 0 100 100" preserveAspectRatio="none"></svg><div class="rune-core"><span>✧</span><small>THE SEAL</small></div>${nums.map((n,i)=>`<button class="rune-orb" data-rune="${n}" data-x="${slots[i][0]}" data-y="${slots[i][1]}" style="left:${slots[i][0]}%;top:${slots[i][1]}%" aria-label="Rune ${n}"><i>ᛟ</i><b>${n}</b></button>`).join('')}</div><div class="rune-footnote">The golden trail remembers every correct touch.</div>`);
    document.querySelectorAll('[data-rune]').forEach(b=>b.addEventListener('click',()=>{
      if(runtime.failed||runtime.completed||runtime.paused||b.classList.contains('correct'))return;
      const n=+b.dataset.rune;
      if(n===runtime.next){b.classList.add('correct');runtime.runePoints.push([+b.dataset.x,+b.dataset.y]);drawRuneTrail();correctAction(38);runtime.next++;
        const cnt=document.getElementById('rune-count');if(cnt)cnt.textContent=`${runtime.next-1} / ${len}`;
        if(runtime.next>len)finishCurrentChallenge();
      }else{b.classList.add('wrong');setTimeout(()=>b.classList.remove('wrong'),300);registerMistake('The rune chain snapped.');}
    }));
  }
  function drawRuneTrail(){
    const svg=document.getElementById('rune-lines');const pts=runtime?.runePoints||[];
    if(!svg)return;svg.innerHTML=pts.slice(1).map((p,i)=>`<line x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${p[0]}" y2="${p[1]}" />`).join('');
  }
  function renderMix(){
    const need=Math.min(5,2+Math.floor(runtime.level.difficulty/2));const recipe=sample(INGREDIENTS,need),options=shuffle([...new Set([...recipe,...sample(INGREDIENTS.filter(x=>!recipe.includes(x)),Math.min(7,need+2))])]).slice(0,9);runtime.recipe=recipe;runtime.selected=[];
    panel(`${objective('Distill the memory','Select the exact notes in the formula, then seal the vial.','PERFUMER TRIAL')}<div class="alchemy-scene"><div class="alchemy-scene-stars"></div><div class="alchemy-vial"><div class="alchemy-liquid" id="alchemy-liquid"></div><div class="alchemy-neck"></div><span class="alchemy-sheen">✧</span></div><div class="alchemy-lore"><b>FORMULA No. ${String(runtime.level.n).padStart(2,'0')}</b><small id="alchemy-count">0 / ${need} notes</small></div></div><div class="recipe">${recipe.map((x,i)=>`<span><b>${i+1}</b>${esc(x)}</span>`).join('')}</div><div class="ingredient-grid">${options.map(x=>`<button class="choice-btn" data-ing="${esc(x)}"><span>◌</span>${esc(x)}</button>`).join('')}</div><button class="primary" id="seal-vial">Seal the vial</button>`);
    document.querySelectorAll('[data-ing]').forEach(b=>b.addEventListener('click',()=>{sound();vibrate();const name=b.dataset.ing,idx=runtime.selected.indexOf(name);if(idx>=0){runtime.selected.splice(idx,1);b.classList.remove('selected');}else{runtime.selected.push(name);b.classList.add('selected');}const liquid=document.getElementById('alchemy-liquid');if(liquid)liquid.style.height=`${Math.min(85,14+runtime.selected.length*17)}%`;const amount=document.getElementById('alchemy-count');if(amount)amount.textContent=`${runtime.selected.length} / ${need} notes`; }));
    document.getElementById('seal-vial').addEventListener('click',()=>{const a=[...runtime.selected].sort().join('|'),r=[...recipe].sort().join('|');if(a===r){correctAction(140);finishCurrentChallenge();}else registerMistake('The formula destabilized. Match every listed note.');});
  }

function renderHidden(){
  const targetCount=Math.min(7,3+Math.floor(runtime.level.difficulty/2));
  const target=sample(ICONS,targetCount),decoys=sample(ICONS.filter(x=>!target.includes(x)),Math.min(7,14-targetCount)),board=shuffle([...target,...decoys]);
  const spots=[[18,17],[75,21],[40,12],[65,76],[18,72],[86,51],[49,65],[31,40],[62,37],[10,51],[82,82],[35,83],[45,30],[75,62]];
  runtime.targets=new Set(target);runtime.found=new Set();
  panel(`${objective('Secrets in the architecture',`Search the room for ${targetCount} marked sigils. Be careful of decoys.`,'SCENE EXPLORATION')}<div class="target-ribbon">${target.map(x=>`<span data-target-label="${esc(x)}">${x}</span>`).join('')}</div><div class="explore-board" style="--room:url('./world-${runtime.world.id}.svg')"><div class="explore-vignette"></div>${board.map((x,i)=>`<button class="hidden-hotspot" data-hidden="${i}" data-symbol="${esc(x)}" style="--x:${spots[i][0]}%;--y:${spots[i][1]}%;--delay:${(i%5)*.19}s" aria-label="Find hidden sigil ${i+1}"><span>${x}</span></button>`).join('')}<div class="scene-instruction">${targetCount} SECRETS ARE HIDDEN IN THIS ROOM</div></div>`);
  document.querySelectorAll('[data-hidden]').forEach(b=>b.addEventListener('click',()=>{const sym=b.dataset.symbol;if(b.classList.contains('done')||runtime.failed||runtime.completed)return;if(runtime.targets.has(sym)){runtime.found.add(sym);b.classList.add('done');document.querySelector(`[data-target-label="${CSS.escape(sym)}"]`)?.classList.add('found');correctAction(42);if(runtime.found.size===targetCount)finishCurrentChallenge();}else{b.classList.add('wrong');setTimeout(()=>b.classList.remove('wrong'),310);registerMistake('That sigil belongs to another memory.');}}));
}

  function renderMemory(){
    const len=Math.min(8,3+Math.floor(runtime.level.difficulty/2)),pads=ICONS.slice(0,6),seq=Array.from({length:len},()=>pads[Math.floor(Math.random()*pads.length)]);runtime.sequence=seq;runtime.input=[];runtime.inputLocked=true;runtime.memoryRound=0;
    panel(`${objective('Echo the memory','Watch Luma’s pulse, then repeat the complete sequence.','LUMA ECHO')}<div class="memory-status">${seq.map(()=>'<i class="dot"></i>').join('')}</div><div class="game-grid memory-grid">${pads.map(x=>`<button class="game-tile memory-pad" data-pad="${esc(x)}">${x}</button>`).join('')}</div><button class="secondary" data-replay-memory="1">Replay sequence</button>`);
    const instance=runtime;const playSequence=()=>{if(runtime!==instance||runtime.failed||runtime.completed||runtime.paused)return;runtime.memoryRound++;const round=runtime.memoryRound;runtime.inputLocked=true;runtime.input=[];const dots=[...document.querySelectorAll('.dot')];dots.forEach(d=>d.classList.remove('on'));let delay=250;seq.forEach((sym,idx)=>{setTimeout(()=>{if(runtime!==instance||runtime.memoryRound!==round||runtime.paused)return;const b=[...document.querySelectorAll('[data-pad]')].find(x=>x.dataset.pad===sym);if(!b)return;b.classList.add('lit');dots[idx]?.classList.add('on');sound('tap');setTimeout(()=>b?.classList.remove('lit'),220);},delay);delay+=420;});setTimeout(()=>{if(runtime===instance&&!runtime.failed&&!runtime.completed&&runtime.memoryRound===round&&!runtime.paused){runtime.inputLocked=false;toast('Your turn. Repeat the echo.');}},delay+60);};
    runtime.playMemory=playSequence;playSequence();document.querySelector('[data-replay-memory]').addEventListener('click',()=>{if(runtime.inputLocked)return;runtime.bonus=Math.max(0,runtime.bonus-30);playSequence();});
    document.querySelectorAll('[data-pad]').forEach(b=>b.addEventListener('click',()=>{if(!runtime||runtime.inputLocked)return;const sym=b.dataset.pad,idx=runtime.input.length;if(sym===runtime.sequence[idx]){runtime.input.push(sym);correctAction(36);if(runtime.input.length===runtime.sequence.length)finishCurrentChallenge();}else{registerMistake('The echo broke. Watch the sequence again.');setTimeout(playSequence,450);}}));
  }
  function renderLock(){
    const dials=Math.min(5,3+Math.floor(runtime.level.difficulty/3));runtime.lockTarget=Array.from({length:dials},()=>LOCK_SIGILS[Math.floor(Math.random()*LOCK_SIGILS.length)]);runtime.lockCurrent=Array.from({length:dials},()=>LOCK_SIGILS[Math.floor(Math.random()*LOCK_SIGILS.length)]);
    panel(`${objective('Break the impossible lock','Rotate each ring until the live sigils match the sealed code.','LOCK MECHANISM')}<div class="lock-target"><span>SEALED CODE</span><div>${runtime.lockTarget.map(x=>`<b>${x}</b>`).join('')}</div></div><div class="dial-row">${runtime.lockCurrent.map((x,i)=>`<button class="dial" data-dial="${i}"><small>RING ${i+1}</small><b>${x}</b><span>tap to rotate</span></button>`).join('')}</div><button class="primary" id="try-lock">Release the lock</button>`);
    document.querySelectorAll('[data-dial]').forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.dial,pos=LOCK_SIGILS.indexOf(runtime.lockCurrent[i]);runtime.lockCurrent[i]=LOCK_SIGILS[(pos+1)%LOCK_SIGILS.length];b.querySelector('b').textContent=runtime.lockCurrent[i];sound();vibrate();}));
    document.getElementById('try-lock').addEventListener('click',()=>{if(runtime.lockCurrent.join('')===runtime.lockTarget.join('')){correctAction(160);finishCurrentChallenge();}else registerMistake('The rings are not aligned yet.');});
  }
  function renderPairs(){
    const pairs=Math.min(6,3+Math.floor(runtime.level.difficulty/2)),symbols=sample(ICONS,pairs),cards=shuffle(symbols.flatMap((s,i)=>[{s,id:`${i}a`},{s,id:`${i}b`}])) ;runtime.pairOpen=[];runtime.pairsFound=0;runtime.pairLocked=false;
    panel(`${objective('Match the mirrored fragments','Reveal two cards at a time and recover every matching pair.','MIRROR MEMORY')}<div class="pair-grid">${cards.map((c,i)=>`<button class="pair-card" data-pair="${i}" data-symbol="${esc(c.s)}"><span class="back">✧</span><span class="front">${c.s}</span></button>`).join('')}</div>`);
    document.querySelectorAll('[data-pair]').forEach(b=>b.addEventListener('click',()=>{if(runtime.pairLocked||b.classList.contains('matched')||b.classList.contains('open'))return;b.classList.add('open');sound();runtime.pairOpen.push(b);if(runtime.pairOpen.length===2){runtime.pairLocked=true;const instance=runtime;const [a,c]=runtime.pairOpen;if(a.dataset.symbol===c.dataset.symbol){setTimeout(()=>{if(runtime!==instance||runtime.failed||runtime.completed||runtime.paused)return;a.classList.add('matched');c.classList.add('matched');runtime.pairOpen=[];runtime.pairLocked=false;runtime.pairsFound++;correctAction(70);if(runtime.pairsFound===pairs)finishCurrentChallenge();},240);}else{setTimeout(()=>{if(runtime!==instance||runtime.failed||runtime.completed||runtime.paused)return;a.classList.remove('open');c.classList.remove('open');runtime.pairOpen=[];runtime.pairLocked=false;registerMistake('The mirror rejected that pair.');},520);}}}));
  }

  function renderConstellation(){
    const count=Math.min(8,4+Math.floor(runtime.level.difficulty/2));
    const target=sample(ICONS,count),decoys=sample(ICONS.filter(x=>!target.includes(x)),Math.min(4,10-count));
    const coords=[[12,22],[34,12],[59,20],[83,12],[20,48],[48,42],[78,46],[10,75],[38,72],[65,78],[88,70],[53,92]];
    const symbols=shuffle([...target,...decoys]).slice(0,Math.min(12,target.length+decoys.length));
    runtime.constellationTarget=target;runtime.constellationNext=0;runtime.constellationPoints=[];
    const nodes=symbols.map((sym,i)=>{const [x,y]=coords[i];return `<button class="star-node" data-star="${i}" data-symbol="${esc(sym)}" data-x="${x}" data-y="${y}" style="left:${x}%;top:${y}%">${sym}</button>`}).join('');
    panel(`${objective('Trace the lost constellation','Follow the glyph route in order. Each correct star draws the pattern.','CELESTIAL TRACE')}<div class="constellation-target">${target.map((x,i)=>`<span data-const-label="${i}">${x}</span>`).join('<i>›</i>')}</div><div class="constellation-board"><svg id="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>${nodes}<div class="constellation-glow"></div></div>`);
    document.querySelectorAll('[data-star]').forEach(b=>b.addEventListener('click',()=>{
      if(runtime.failed||runtime.completed||b.classList.contains('lit'))return;
      const expected=runtime.constellationTarget[runtime.constellationNext];
      if(b.dataset.symbol===expected){
        b.classList.add('lit');document.querySelector(`[data-const-label="${runtime.constellationNext}"]`)?.classList.add('done');
        runtime.constellationPoints.push([+b.dataset.x,+b.dataset.y]);runtime.constellationNext++;correctAction(52);drawConstellationTrail();
        if(runtime.constellationNext>=runtime.constellationTarget.length)finishCurrentChallenge();
      }else{b.classList.add('wrong');setTimeout(()=>b.classList.remove('wrong'),300);registerMistake('That star does not belong to the next point in the route.');}
    }));
  }
  function drawConstellationTrail(){
    const svg=document.getElementById('constellation-lines');if(!svg||!runtime)return;const pts=runtime.constellationPoints||[];
    svg.innerHTML=pts.slice(1).map((p,i)=>`<line x1="${pts[i][0]}" y1="${pts[i][1]}" x2="${p[0]}" y2="${p[1]}" />`).join('');
  }

  function renderBossStage(){
    const types=BOSS_TYPES[runtime.world.id-1],stage=runtime.bossStage,type=types[stage-1];renderMiniGame(type);const p=document.getElementById('game-panel');if(p)p.insertAdjacentHTML('afterbegin',`<div class="boss-banner"><span>RIFT TRIAL</span><b>${stage}/4</b><i style="width:${stage*25}%"></i></div>`);
  }

  function useBooster(type){
    if(!runtime||runtime.completed||runtime.failed||!runtime.active||state.boosters[type]<=0)return;
    if(type==='ward'){
      if(runtime.wardActive){toast('Ward is already active.','bad');return;}state.boosters.ward--;runtime.wardActive=true;toast('Ward active — your next mistake is protected.');
    }else if(type==='chrono'){
      state.boosters.chrono--;runtime.started+=10000;runtime.elapsed=Math.max(0,runtime.elapsed-10);runtime.bonus+=80;toast('Chrono rewound 10 seconds.');
    }else if(type==='hint'){
      state.boosters.hint--;applyHint();
    }
    saveState();sound('relic');document.querySelectorAll('[data-booster]').forEach(b=>{const k=b.dataset.booster;b.querySelector('b').textContent=state.boosters[k];if(state.boosters[k]<=0)b.disabled=true;});
  }
  function applyHint(){
    const type=runtime.type;
    if(type==='restore'){document.querySelector('[data-frag]:not(.done)')?.classList.add('hinted');toast('A fragment is glowing brighter.');}
    else if(type==='sequence'){document.querySelector(`[data-rune="${runtime.next}"]`)?.classList.add('hinted');toast(`Next rune: ${runtime.next}`);}
    else if(type==='mix'){document.querySelectorAll('[data-ing]').forEach(b=>b.classList.toggle('hinted',runtime.recipe.includes(b.dataset.ing)));toast('The true notes are shimmering.');}
    else if(type==='hidden'){const sym=[...runtime.targets].find(x=>!runtime.found.has(x));document.querySelector(`[data-symbol="${CSS.escape(sym)}"]`)?.classList.add('hinted');toast('One hidden sigil has been revealed.');}
    else if(type==='memory'){toast('Luma will replay the sequence.');document.querySelector('[data-replay-memory]')?.click();}
    else if(type==='lock'){const i=runtime.lockCurrent.findIndex((x,j)=>x!==runtime.lockTarget[j]);if(i>=0){runtime.lockCurrent[i]=runtime.lockTarget[i];const b=document.querySelector(`[data-dial="${i}"] b`);if(b)b.textContent=runtime.lockCurrent[i];}toast('One ring aligned itself.');}
    else if(type==='pairs'){const cards=[...document.querySelectorAll('[data-pair]:not(.matched)')];const by={};cards.forEach(b=>(by[b.dataset.symbol]??=[]).push(b));const pair=Object.values(by).find(x=>x.length>=2);pair?.forEach(b=>b.classList.add('hinted'));toast('A matching pair is shimmering.');}
    else if(type==='constellation'){const sym=runtime.constellationTarget?.[runtime.constellationNext];[...document.querySelectorAll('[data-star]')].find(b=>b.dataset.symbol===sym&&!b.classList.contains('lit'))?.classList.add('hinted');toast('The next star is burning brighter.');}
  }

  function failLevel(reason){
    if(!runtime||runtime.completed||runtime.failed)return;runtime.failed=true;runtime.paused=true;if(levelInterval){clearInterval(levelInterval);levelInterval=null;}sound('bad');vibrate(180);
    const canRevive=!runtime.reviveUsed&&state.gems>=2;
    const o=document.createElement('div');o.className='result fail-overlay';o.innerHTML=`<div class="result-card fail-card"><div class="result-emblem fracture">✕</div><div class="kicker">MEMORY FRACTURED</div><h2>${esc(runtime.level.title)}</h2><p>${esc(reason)}</p><div class="score-breakdown"><div><b>${runtime.score}</b><span>Score</span></div><div><b>×${runtime.maxCombo}</b><span>Best combo</span></div><div><b>${runtime.elapsed}s</b><span>Time</span></div></div><div class="stability-breaks">${Array.from({length:runtime.level.mistakeLimit},(_,i)=>`<i class="${i<runtime.mistakes?'broken':''}">◇</i>`).join('')}</div>${canRevive?'<button class="primary revive-btn" data-revive="1">✧ 2 • Bind the memory and continue</button>':'<p class="revive-note">A revive costs 2 earned gems and can be used once per attempt.</p>'}<button class="secondary" data-retry="1">Retry from briefing</button><button class="text-btn" data-fail-map="1">Return to world map</button></div>`;document.body.appendChild(o);
    o.querySelector('[data-revive]')?.addEventListener('click',()=>{
      if(state.gems<2||runtime.reviveUsed)return;state.gems-=2;state.stats.revives=(state.stats.revives||0)+1;runtime.reviveUsed=true;runtime.failed=false;runtime.paused=false;runtime.mistakes=Math.max(0,runtime.level.mistakeLimit-2);runtime.combo=0;runtime.started=Date.now()-Math.min(runtime.elapsed,Math.max(0,runtime.level.timeLimit-18))*1000;runtime.elapsed=Math.min(runtime.elapsed,Math.max(0,runtime.level.timeLimit-18));const m=document.getElementById('mistakes');if(m)m.textContent=`${runtime.mistakes}/${runtime.level.mistakeLimit}`;saveState();o.remove();startClock();sound('relic');toast('The memory is bound. You have one more chance.');
    });
    o.querySelector('[data-retry]').addEventListener('click',()=>{const n=runtime.level.n;o.remove();renderLevel(n);});
    o.querySelector('[data-fail-map]').addEventListener('click',()=>{o.remove();renderWorlds();});
  }

  function finishCurrentChallenge(){
    if(!runtime||runtime.completed)return;
    if(runtime.level.boss&&runtime.bossStage<4){const instance=runtime;runtime.bossStage++;runtime.bonus+=180;sound('win');toast(`Rift trial ${runtime.bossStage-1} sealed.`);setTimeout(()=>{if(runtime===instance&&!runtime.failed&&!runtime.completed)renderBossStage();},430);return;}
    completeLevel();
  }

  function completeLevel(){
    if(!runtime||runtime.completed)return;runtime.completed=true;clearInterval(levelInterval);levelInterval=null;
    const l=runtime.level,time=runtime.elapsed||Math.floor((Date.now()-runtime.started)/1000),accuracy=runtime.totalActions?runtime.correctActions/runtime.totalActions:1;
    const perfect=runtime.mistakes===0&&time<=l.targetTime;
    const stars=perfect?3:(runtime.mistakes<=2&&accuracy>=.72&&time<=l.targetTime*1.8?2:1);
    const comboBonus=runtime.maxCombo*24,accuracyBonus=Math.round(accuracy*250),timeBonus=Math.max(0,Math.round((l.targetTime-time)*12));
    const finalScore=Math.max(100,runtime.score+stars*140+comboBonus+accuracyBonus+timeBonus+(l.boss?650:0));
    const first=!state.completed[l.n];
    state.completed[l.n]=true;state.stars[l.n]=Math.max(state.stars[l.n]||0,stars);state.bestScores[l.n]=Math.max(state.bestScores[l.n]||0,finalScore);
    state.stats.levelsPlayed++;state.stats.totalScore+=finalScore;state.stats.totalMistakes+=runtime.mistakes;state.stats.bestCombo=Math.max(state.stats.bestCombo,runtime.maxCombo);if(perfect)state.stats.perfects++;
    if(first){state.coins+=90+l.difficulty*15+(l.boss?300:0);state.gems+=l.boss?4:(l.n%5===0?1:0);state.xp+=100+l.difficulty*24+(l.boss?100:0);state.rank=rankFromXP(state.xp);state.unlockedLevel=Math.min(61,Math.max(state.unlockedLevel,l.n+1));state.companionLevel=Math.min(5,Math.floor(countCompleted(state)/10));unlockRelicForLevel(l.n,state,true);if(l.n%10===0){state.boosters.hint++;state.boosters.ward++;state.boosters.chrono++;}}
    state.restoration=calcRestoration();updateMissions(stars,finalScore);checkAchievements();saveState();sound('win');vibrate(120);showResult(l,stars,finalScore,first,{perfect,accuracy,comboBonus,timeBonus});
  }

  function unlockRelicForLevel(n,targetState=state,notify=true){
    const relic=relicForLevel(n);if(!relic||targetState.relics.includes(relic.id))return;
    targetState.relics.push(relic.id);if(notify)setTimeout(()=>{sound('relic');toast(`${relic.rarity} relic: ${relic.name}`);},450);
  }
  function checkAchievements(notify=true){ACHIEVEMENTS.forEach(a=>{if(!state.achievements[a.id]&&a.test(state)){state.achievements[a.id]=true;if(notify)toast(`Achievement unlocked: ${a.name}`);}});saveState();}

  function showResult(level,stars,score,first,meta){
    const relic=relicForLevel(level.n),coinReward=first?90+level.difficulty*15+(level.boss?300:0):0;
    const nextLabel=level.n===60?'Reveal the ending':level.boss?'Open the next world':'Continue story';
    const worldPct=Math.min(100,(level.within/10)*100);
    const o=document.createElement('div');o.className='result';o.innerHTML=`<div class="result-card win-card"><div class="result-emblem">${meta.perfect?'✦':level.boss?'♛':'◇'}</div><div class="kicker">${meta.perfect?'PERFECT MEMORY':level.boss?'RIFT SEALED':'MEMORY RESTORED'}</div><h2>${esc(level.title)}</h2><div class="big-stars">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div><div class="result-score">${score.toLocaleString()} <span>points</span></div><div class="score-breakdown"><div><b>${Math.round(meta.accuracy*100)}%</b><span>Accuracy</span></div><div><b>×${runtime.maxCombo}</b><span>Best combo</span></div><div><b>+${meta.timeBonus}</b><span>Time bonus</span></div></div><div class="world-progress-result"><span>World ${level.world} restoration</span><div class="progress"><i style="width:${worldPct}%"></i></div></div><div class="rewards">${coinReward?`<span>◈ +${coinReward}</span>`:''}${first&&relic?`<span>${relic.emoji} ${relic.rarity}</span>`:''}${level.boss&&first?'<span>✦ Booster set</span>':''}</div>${first&&relic?`<div class="relic-reveal"><span>${relic.emoji}</span><div><small>${relic.rarity.toUpperCase()} RELIC</small><b>${esc(relic.name)}</b></div></div>`:''}<div class="story-card">${esc(level.storyBeat)}</div><button class="primary" data-result-next="1">${nextLabel}</button><button class="secondary" data-result-map="1">World map</button></div>`;document.body.appendChild(o);
    o.querySelector('[data-result-next]').addEventListener('click',()=>{o.remove();if(level.n===60)renderFinale(0);else if(level.boss)renderWorldTransition(level.world+1);else renderLevel(level.n+1);});
    o.querySelector('[data-result-map]').addEventListener('click',()=>{o.remove();renderWorlds();});
  }

  function renderWorldTransition(worldId){
    cleanupRuntime();const w=WORLDS[worldId-1];if(!w)return renderHome();
    app.innerHTML=`<main class="chapter-transition">${sceneArt(worldId)}<div class="chapter-transition-copy"><span class="eyebrow">WORLD ${worldId} UNSEALED</span><div class="chapter-roman">${String(worldId).padStart(2,'0')}</div><h1>${w.emoji} ${esc(w.name)}</h1><p>${esc(w.story)}</p><div class="chapter-whisper">“${esc(w.subtitle)}”</div><button class="primary" data-enter-world="1">Enter World ${worldId}</button><button class="text-btn" data-transition-home="1">Return to Atelier</button></div></main>`;
    document.querySelector('[data-enter-world]').addEventListener('click',()=>renderLevel((worldId-1)*10+1));
    document.querySelector('[data-transition-home]').addEventListener('click',renderHome);sound('cinematic');
  }

  function renderFinale(step=0){
    cleanupRuntime();
    const scenes=[
      {k:'THE HEART',title:'The atelier was never abandoned.',text:'It hid itself inside the memories you restored, waiting for someone history could not erase.',symbol:'✦'},
      {k:'THE WITNESS',title:'You were not chosen to inherit it.',text:'You were chosen to remember it. Every relic returns to its place as the erased names appear across the walls.',symbol:'👁️'},
      {k:'THE LAST DOOR',title:'Then a seventh lock turns.',text:'Beyond it is a corridor that does not exist on any map. Luma flies ahead. The atelier is whole — but the story is not over.',symbol:'🚪'}
    ];
    const x=scenes[step];app.innerHTML=`<main class="cinematic finale-cinematic"><div class="cinematic-art finale-art c${Math.min(3,step+1)}"><div class="cinematic-symbol">${x.symbol}</div><div class="cinematic-rings"></div></div><div class="cinematic-copy"><div class="kicker">${x.k}</div><h1>${x.title}</h1><p>${x.text}</p><div class="cinematic-dots">${scenes.map((_,i)=>`<i class="${i===step?'on':''}"></i>`).join('')}</div><button class="primary" data-finale-next="1">${step===scenes.length-1?'Return to the Restored Atelier':'Continue'}</button></div></main>`;
    document.querySelector('[data-finale-next]').addEventListener('click',()=>{sound('cinematic');if(step<scenes.length-1)renderFinale(step+1);else renderHome();});
  }

  function openSecret(id){
    const room=SECRET_ROOMS[id-1];if(!room)return;const found=(state.secrets||[]).includes(id);
    const o=document.createElement('div');o.className='result';o.innerHTML=`<div class="result-card secret-result"><div class="result-emblem">${room.symbol}</div><div class="kicker">HIDDEN CHAMBER • WORLD ${id}</div><h2>${esc(room.name)}</h2><div class="story-card">${esc(room.lore)}</div>${found?'<p>This chamber has already yielded its reward.</p>':'<div class="rewards"><span>◈ +180</span><span>✧ +1</span><span>✦ Hint +1</span></div>'}<button class="primary" data-secret-close="1">Return to map</button></div>`;document.body.appendChild(o);
    if(!found){state.secrets??=[];state.secrets.push(id);state.coins+=180;state.gems+=1;state.boosters.hint+=1;checkAchievements();saveState();sound('relic');}
    o.querySelector('[data-secret-close]').addEventListener('click',()=>{o.remove();renderWorlds();});
  }

  function claimDaily(){
    const t=today();if(state.dailyClaimDate===t){toast('Today’s parcel is already open.','bad');return;}
    const delta=dayDelta(state.dailyClaimDate,t);state.dailyStreak=delta===1?((state.dailyStreak||0)%7)+1:1;state.dailyClaimDate=t;
    const day=state.dailyStreak,rewards=[0,150,190,230,280,340,420,600],gems=[0,1,1,1,2,2,2,5],coins=rewards[day],gemReward=gems[day];state.coins+=coins;state.gems+=gemReward;if(day===3||day===6)state.boosters.hint++;if(day===7){state.boosters.ward++;state.boosters.chrono++;}
    saveState();sound('relic');toast(`Streak Day ${day}: +${coins} coins, +${gemReward} gem${gemReward>1?'s':''}${day===7?' + master boosters':''}.`);renderHome();
  }

  function bindCommon(){
    document.querySelectorAll('[data-go]').forEach(b=>b.addEventListener('click',()=>{sound();const x=b.dataset.go;({home:renderHome,worlds:renderWorlds,vault:renderVault,atelier:renderAtelier,achievements:renderAchievements,settings:renderSettings,shop:renderShop}[x]||renderHome)();}));
    document.querySelectorAll('[data-play]').forEach(b=>b.addEventListener('click',()=>{sound();renderLevel(+b.dataset.play);}));
    document.querySelectorAll('[data-daily]').forEach(b=>b.addEventListener('click',claimDaily));
    document.querySelectorAll('[data-mission]').forEach(b=>b.addEventListener('click',()=>claimMission(b.dataset.mission)));
    document.querySelectorAll('[data-weekly]').forEach(b=>b.addEventListener('click',claimWeekly));
    document.querySelectorAll('[data-secret]').forEach(b=>b.addEventListener('click',()=>openSecret(+b.dataset.secret)));
    document.querySelectorAll('[data-back]').forEach(b=>b.addEventListener('click',renderAtelier));
    document.querySelectorAll('[data-setting]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.setting;state.settings[k]=!state.settings[k];if(k==='music'){if(state.settings.music)startMusic();else stopMusic();}if(k==='reducedMotion')document.documentElement.classList.toggle('reduce-motion',state.settings.reducedMotion);saveState();renderSettings();}));
    document.querySelectorAll('[data-reset]').forEach(b=>b.addEventListener('click',()=>{if(confirm('Reset all Lost Atelier progress on this device?')){stopMusic();state=defaultState();saveState();renderCinematic(0);}}));
  }

  function cleanupRuntime(){if(levelInterval){clearInterval(levelInterval);levelInterval=null;}runtime=null;document.querySelectorAll('.result').forEach(x=>x.remove());}

  window.addEventListener('beforeunload',saveState);
  if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));}
  document.addEventListener('visibilitychange',()=>{if(runtime&&!runtime.completed&&!runtime.failed){if(document.hidden)pauseRuntime();else resumeRuntime();}if(document.hidden&&musicNodes)stopMusic();else if(!document.hidden&&state.settings.music)startMusic();});

  window.__ATELIER_TEST__={
    version:VERSION,
    levels:LEVELS.map(x=>({...x})),
    relics:RELICS.map(x=>({...x})),
    getState:()=>JSON.parse(JSON.stringify(state)),
    getRuntime:()=>runtime?JSON.parse(JSON.stringify({...runtime,targets:runtime.targets?[...runtime.targets]:undefined,found:runtime.found?[...runtime.found]:undefined,pairOpen:undefined})):null,
    go:n=>renderLevel(n),
    begin:()=>beginChallenge(),
    skipIntro:()=>{state.cinematicSeen=true;saveState();renderHome();},
    unlockAll:()=>{state.cinematicSeen=true;state.unlockedLevel=60;saveState();renderWorlds();},
    forceComplete:()=>{if(runtime&&!runtime.active){runtime.active=true;runtime.started=Date.now();}completeLevel();},
    resetAndSkipIntro:()=>{state=defaultState();state.cinematicSeen=true;saveState();renderHome();},
    grantBoosters:()=>{state.boosters={hint:99,ward:99,chrono:99};saveState();}
  };

  ensureMissions();
  if(state.settings.reducedMotion)document.documentElement.classList.add('reduce-motion');
  if(state.cinematicSeen)renderHome();else renderCinematic(0);
})();
