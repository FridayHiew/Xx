/* ============================================================
   core/audio.js - 仙侠国风背景音乐与环境音效系统 (Web Audio API)
   ============================================================ */

(function () {
  const STORAGE_KEY = "xiuxian_audio_settings";

  // 五声音阶 (D 调 宫商角徵羽: D, E, F#, A, B)
  const NOTES = {
    D2: 73.42,  E2: 82.41,  Fs2: 92.50,  A2: 110.00, B2: 123.47,
    D3: 146.83, E3: 164.81, Fs3: 185.00, A3: 220.00, B3: 246.94,
    D4: 293.66, E4: 329.63, Fs4: 369.99, A4: 440.00, B4: 493.88,
    D5: 587.33, E5: 659.25, Fs5: 739.99, A5: 880.00, B5: 987.77,
    D6: 1174.66
  };

  // 仙侠主题旋律库
  const THEMES = {
    fairy: {
      name: "清幽雅韵",
      desc: "古筝与竹笛交织，如穿行于仙山翠竹之间",
      tempo: 88,
      melody: [
        { note: "A4", dur: 1.5, type: "zheng" },
        { note: "Fs4", dur: 0.8, type: "zheng" },
        { note: "E4", dur: 0.8, type: "zheng" },
        { note: "D4", dur: 2.2, type: "zheng" },
        { note: "Fs4", dur: 1.2, type: "flute" },
        { note: "A4", dur: 1.2, type: "flute" },
        { note: "B4", dur: 2.5, type: "flute" },
        { note: "A4", dur: 1.2, type: "zheng" },
        { note: "Fs4", dur: 0.6, type: "zheng" },
        { note: "E4", dur: 0.6, type: "zheng" },
        { note: "D4", dur: 1.5, type: "zheng" },
        { note: "E4", dur: 2.0, type: "zheng" },
        { note: "D5", dur: 1.5, type: "flute" },
        { note: "B4", dur: 1.0, type: "flute" },
        { note: "A4", dur: 2.2, type: "flute" },
        { note: "Fs4", dur: 1.0, type: "zheng" },
        { note: "A4", dur: 1.0, type: "zheng" },
        { note: "D4", dur: 3.0, type: "zheng" },
      ],
      bellInterval: 14,
      droneRoot: "D3",
      droneFifth: "A3"
    },
    guqin: {
      name: "云水抚琴",
      desc: "古琴浑厚旷远，水滴空灵，清心悟道",
      tempo: 62,
      melody: [
        { note: "D3", dur: 2.5, type: "qin" },
        { note: "A3", dur: 2.0, type: "qin" },
        { note: "B3", dur: 1.5, type: "qin" },
        { note: "D4", dur: 3.5, type: "qin" },
        { note: "E4", dur: 2.0, type: "qin" },
        { note: "Fs4", dur: 1.8, type: "qin" },
        { note: "D4", dur: 2.5, type: "qin" },
        { note: "B3", dur: 2.0, type: "qin" },
        { note: "A3", dur: 4.0, type: "qin" },
        { note: "Fs3", dur: 2.2, type: "qin" },
        { note: "E3", dur: 2.0, type: "qin" },
        { note: "D3", dur: 4.5, type: "qin" },
      ],
      bellInterval: 18,
      droneRoot: "D2",
      droneFifth: "A2"
    },
    zen: {
      name: "九霄入定",
      desc: "玄门古钟鸣响，仙气长鸣，天地合一",
      tempo: 52,
      melody: [
        { note: "A3", dur: 3.5, type: "bell" },
        { note: "D4", dur: 3.0, type: "qin" },
        { note: "Fs4", dur: 2.5, type: "flute" },
        { note: "A4", dur: 4.0, type: "flute" },
        { note: "E4", dur: 3.0, type: "qin" },
        { note: "D4", dur: 4.5, type: "bell" },
        { note: "B3", dur: 3.5, type: "qin" },
        { note: "A3", dur: 5.0, type: "qin" },
      ],
      bellInterval: 10,
      droneRoot: "D2",
      droneFifth: "Fs2"
    }
  };

  class XianxiaAudioEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.compressor = null;
      this.delayNode = null;
      this.delayGain = null;
      this.reverbFilter = null;
      this.droneNodes = [];

      this.isPlaying = false;
      this.isMuted = false;
      this.volume = 0.6;
      this.currentThemeKey = "fairy";

      this.stepIndex = 0;
      this.loopTimer = null;
      this.bellTimer = null;
      this.dropTimer = null;

      this.loadSettings();
      this.initDom();
      this.setupInteractionListeners();
    }

    loadSettings() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const cfg = JSON.parse(raw);
          if (typeof cfg.isMuted === "boolean") this.isMuted = cfg.isMuted;
          if (typeof cfg.volume === "number") this.volume = Math.max(0, Math.min(1, cfg.volume));
          if (cfg.theme && THEMES[cfg.theme]) this.currentThemeKey = cfg.theme;
          if (typeof cfg.isPlaying === "boolean") this.isPlaying = cfg.isPlaying;
        }
      } catch (e) {
        console.warn("读取音频配置异常", e);
      }
    }

    saveSettings() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          isMuted: this.isMuted,
          volume: this.volume,
          theme: this.currentThemeKey,
          isPlaying: this.isPlaying
        }));
      } catch (e) {
        // ignore
      }
    }

    ensureContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) {
          console.warn("当前浏览器不支持 Web Audio API");
          return false;
        }
        this.ctx = new AudioCtx();

        // 动态压限器，防止混音爆音
        this.compressor = this.ctx.createDynamicsCompressor();
        this.compressor.threshold.setValueAtTime(-18, this.ctx.currentTime);
        this.compressor.knee.setValueAtTime(15, this.ctx.currentTime);
        this.compressor.ratio.setValueAtTime(6, this.ctx.currentTime);
        this.compressor.attack.setValueAtTime(0.005, this.ctx.currentTime);
        this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);

        // 主音量
        this.masterGain = this.ctx.createGain();
        const initialVol = this.isMuted ? 0 : this.volume;
        this.masterGain.gain.setValueAtTime(initialVol, this.ctx.currentTime);

        // 仙境立体声回响/混响网络 (Feedback Delay Network)
        this.delayNode = this.ctx.createDelay();
        this.delayNode.delayTime.setValueAtTime(0.42, this.ctx.currentTime);

        this.delayGain = this.ctx.createGain();
        this.delayGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

        this.reverbFilter = this.ctx.createBiquadFilter();
        this.reverbFilter.type = "lowpass";
        this.reverbFilter.frequency.setValueAtTime(1600, this.ctx.currentTime);

        // 连线
        this.delayNode.connect(this.reverbFilter);
        this.reverbFilter.connect(this.delayGain);
        this.delayGain.connect(this.delayNode);
        this.delayGain.connect(this.masterGain);

        this.masterGain.connect(this.compressor);
        this.compressor.connect(this.ctx.destination);
      }

      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }
      return true;
    }

    // 播放古筝/琵琶音色
    playZheng(freq, duration = 1.8) {
      if (!this.ctx || this.isMuted || this.volume <= 0) return;
      const now = this.ctx.currentTime;

      // 双振荡器加和，形成明亮的琴弦泛音
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = "triangle";
      osc2.type = "sine";

      // 传统按弦/揉弦微调 (Pitch Bend 滑音效果)
      osc1.frequency.setValueAtTime(freq, now);
      osc1.frequency.exponentialRampToValueAtTime(freq * 1.018, now + 0.12);
      osc1.frequency.linearRampToValueAtTime(freq, now + 0.4);

      osc2.frequency.setValueAtTime(freq * 2.002, now); // 微失谐泛音

      // 琴身共鸣低通滤波
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2800, now);
      filter.frequency.exponentialRampToValueAtTime(600, now + duration);

      // 包络：极快弹拨起始 + 自然衰减
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      gain.connect(this.delayNode);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration + 0.1);
      osc2.stop(now + duration + 0.1);
    }

    // 播放古琴音色 (厚重、深沉、木质共鸣)
    playQin(freq, duration = 2.8) {
      if (!this.ctx || this.isMuted || this.volume <= 0) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const subOsc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = "triangle";
      subOsc.type = "sine";

      osc.frequency.setValueAtTime(freq, now);
      // 古琴下按揉颤
      osc.frequency.linearRampToValueAtTime(freq * 0.995, now + 0.15);
      osc.frequency.linearRampToValueAtTime(freq * 1.008, now + 0.5);
      osc.frequency.linearRampToValueAtTime(freq, now + 1.2);

      subOsc.frequency.setValueAtTime(freq * 0.5, now); // 下八度沉底

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1400, now);
      filter.frequency.exponentialRampToValueAtTime(320, now + duration);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.38, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      gain.connect(this.delayNode);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + duration + 0.1);
      subOsc.stop(now + duration + 0.1);
    }

    // 播放竹笛/洞箫音色 (温润、空灵、带气鸣声)
    playFlute(freq, duration = 2.0) {
      if (!this.ctx || this.isMuted || this.volume <= 0) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // 颤音 LFO (Vibrato)
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      lfo.frequency.setValueAtTime(4.6, now);
      lfoGain.gain.setValueAtTime(0, now);
      lfoGain.gain.linearRampToValueAtTime(2.8, now + 0.4); // 延迟淡入颤音
      lfo.connect(osc.frequency);

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(freq * 1.5, now);
      filter.Q.setValueAtTime(1.2, now);

      // 悠长柔和的起音与落音
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.24, now + 0.22);
      gain.gain.linearRampToValueAtTime(0.2, now + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);
      gain.connect(this.delayNode);

      lfo.start(now);
      osc.start(now);
      lfo.stop(now + duration + 0.1);
      osc.stop(now + duration + 0.1);
    }

    // 播放青铜仙钟 / 磬 (悠远钟鸣)
    playBell(freq = 293.66, duration = 5.0) {
      if (!this.ctx || this.isMuted || this.volume <= 0) return;
      const now = this.ctx.currentTime;

      // 钟鸣谐波比例
      const harmonics = [1, 2.76, 5.4, 8.9];
      const gains = [0.22, 0.14, 0.08, 0.03];

      harmonics.forEach((h, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq * h, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(gains[i], now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration * (1 / Math.sqrt(h)));

        osc.connect(gain);
        gain.connect(this.masterGain);
        gain.connect(this.delayNode);

        osc.start(now);
        osc.stop(now + duration + 0.2);
      });
    }

    // 灵泉水滴声 (清冷灵动)
    playWaterDrop() {
      if (!this.ctx || this.isMuted || this.volume <= 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startFreq = 1600 + Math.random() * 800;
      osc.type = "sine";
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(startFreq * 0.5, now + 0.08);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.masterGain);
      gain.connect(this.delayNode);

      osc.start(now);
      osc.stop(now + 0.4);
    }

    // 仙玉触键音效 (轻柔击节)
    playClick() {
      if (!this.ctx || this.isMuted || this.volume <= 0) return;
      if (this.ctx.state === "suspended") this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.035);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.05 * this.volume, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.masterGain || this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    }

    // 启动/更新背景仙山长吟氛围底音 (Ambient Drone)
    updateDrone() {
      if (!this.ctx) return;
      this.stopDrone();
      if (!this.isPlaying || this.isMuted) return;

      const now = this.ctx.currentTime;
      const theme = THEMES[this.currentThemeKey] || THEMES.fairy;
      const rootFreq = NOTES[theme.droneRoot] || NOTES.D3;
      const fifthFreq = NOTES[theme.droneFifth] || NOTES.A3;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = "sine";
      osc2.type = "triangle";

      osc1.frequency.setValueAtTime(rootFreq, now);
      osc2.frequency.setValueAtTime(fifthFreq, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, now);

      gain1.gain.setValueAtTime(0.0001, now);
      gain1.gain.linearRampToValueAtTime(0.08, now + 3.0);

      gain2.gain.setValueAtTime(0.0001, now);
      gain2.gain.linearRampToValueAtTime(0.05, now + 3.0);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain1);
      filter.connect(gain2);

      gain1.connect(this.masterGain);
      gain2.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);

      this.droneNodes = [osc1, osc2, gain1, gain2];
    }

    stopDrone() {
      if (this.droneNodes.length > 0 && this.ctx) {
        const now = this.ctx.currentTime;
        this.droneNodes.forEach(node => {
          try {
            if (node.gain) {
              node.gain.linearRampToValueAtTime(0.0001, now + 0.5);
            } else if (node.stop) {
              node.stop(now + 0.6);
            }
          } catch (e) {
            // ignore
          }
        });
        this.droneNodes = [];
      }
    }

    // 主旋律序列循环
    scheduleNextStep() {
      if (!this.isPlaying) return;

      const theme = THEMES[this.currentThemeKey] || THEMES.fairy;
      const step = theme.melody[this.stepIndex];
      const freq = NOTES[step.note] || 440;

      switch (step.type) {
        case "zheng":
          this.playZheng(freq, step.dur * 1.5);
          break;
        case "qin":
          this.playQin(freq, step.dur * 1.5);
          break;
        case "flute":
          this.playFlute(freq, step.dur * 1.2);
          break;
        case "bell":
          this.playBell(freq, step.dur * 1.8);
          break;
        default:
          this.playZheng(freq, step.dur);
      }

      this.stepIndex = (this.stepIndex + 1) % theme.melody.length;
      const nextDelayMs = (step.dur * 1000) / (theme.tempo / 60);

      this.loopTimer = setTimeout(() => {
        this.scheduleNextStep();
      }, nextDelayMs);
    }

    startLoop() {
      if (this.loopTimer) clearTimeout(this.loopTimer);
      if (this.bellTimer) clearInterval(this.bellTimer);
      if (this.dropTimer) clearInterval(this.dropTimer);

      this.stepIndex = 0;
      this.updateDrone();
      this.scheduleNextStep();

      // 周期性空灵古钟声
      const theme = THEMES[this.currentThemeKey] || THEMES.fairy;
      const bellSec = theme.bellInterval || 16;
      this.bellTimer = setInterval(() => {
        if (this.isPlaying && !this.isMuted) {
          this.playBell(NOTES[theme.droneRoot] ? NOTES[theme.droneRoot] * 2 : 293.66, 6.0);
        }
      }, bellSec * 1000);

      // 随机灵泉水滴
      this.dropTimer = setInterval(() => {
        if (this.isPlaying && !this.isMuted && Math.random() < 0.45) {
          this.playWaterDrop();
        }
      }, 7000);
    }

    stopLoop() {
      if (this.loopTimer) {
        clearTimeout(this.loopTimer);
        this.loopTimer = null;
      }
      if (this.bellTimer) {
        clearInterval(this.bellTimer);
        this.bellTimer = null;
      }
      if (this.dropTimer) {
        clearInterval(this.dropTimer);
        this.dropTimer = null;
      }
      this.stopDrone();
    }

    // 播放/停止控制
    play() {
      if (!this.ensureContext()) return;
      this.isPlaying = true;
      this.applyVolume();
      this.startLoop();
      this.saveSettings();
      this.updateUI();
    }

    pause() {
      this.isPlaying = false;
      this.stopLoop();
      this.saveSettings();
      this.updateUI();
    }

    togglePlay() {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    }

    // 静音切换
    toggleMute() {
      if (!this.isPlaying) {
        this.isMuted = false;
        this.play();
      } else {
        this.isMuted = !this.isMuted;
        this.applyVolume();
        if (this.isMuted) {
          this.stopDrone();
        } else {
          this.updateDrone();
        }
      }
      this.saveSettings();
      this.updateUI();
    }

    // 设置音量
    setVolume(val) {
      val = Math.max(0, Math.min(1, parseFloat(val)));
      this.volume = val;
      if (val > 0 && this.isMuted) {
        this.isMuted = false;
      }
      this.applyVolume();
      this.saveSettings();
      this.updateUI();
    }

    applyVolume() {
      if (!this.ctx || !this.masterGain) return;
      const target = this.isMuted ? 0 : this.volume;
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(target, now + 0.08);
    }

    // 切换主题
    setTheme(themeKey) {
      if (!THEMES[themeKey]) return;
      this.currentThemeKey = themeKey;
      if (this.isPlaying) {
        this.stopLoop();
        this.startLoop();
      }
      this.saveSettings();
      this.updateUI();
    }

    // 用户交互激活（应对浏览器自动播放限制）
    setupInteractionListeners() {
      const unlockAudio = () => {
        if (this.isPlaying && this.ctx && this.ctx.state === "suspended") {
          this.ctx.resume();
        }
      };
      document.addEventListener("click", unlockAudio, { once: true, passive: true });
      document.addEventListener("keydown", unlockAudio, { once: true, passive: true });
      document.addEventListener("touchstart", unlockAudio, { once: true, passive: true });

      // 为所有按钮、标签、交互元素附带温润的仙玉触键音效
      document.addEventListener("click", (e) => {
        if (!e.target) return;
        const target = e.target.closest("button, .tab, .subtab, .icon-btn, .theme-pill");
        if (target) {
          this.playClick();
        }
      }, { passive: true });

      // 页面隐藏时降低负载，恢复时平滑唤醒
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          if (this.ctx && this.ctx.state === "running") {
            this.ctx.suspend();
          }
        } else {
          if (this.isPlaying && this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
          }
        }
      });
    }

    // ========== DOM 与 UI 交互 ==========

    initDom() {
      let wrap = document.getElementById("audioWidget");
      if (!wrap) {
        const topBar = document.querySelector(".top-bar");
        if (!topBar) return;
        const profileIcon = document.getElementById("profileIcon");

        wrap = document.createElement("div");
        wrap.className = "audio-widget";
        wrap.id = "audioWidget";

        wrap.innerHTML = `
          <div class="icon-btn audio-btn muted" id="audioBtn" onclick="onAudioBtnClick(event)" title="仙乐控制 (点击播放/静音，长按或点齿轮调音量)">
            <span id="audioIcon">🔇</span>
            <span class="audio-gear" onclick="openAudioSettings(event)" title="调音量/换曲风">⚙</span>
          </div>
          <div class="audio-popover" id="audioPopover" style="display:none;">
            <div class="popover-header">
              <span class="popover-title">仙音渺渺 · 背景仙乐</span>
              <button class="popover-close" id="audioPopoverClose" onclick="openAudioSettings(event, false)" title="关闭">✕</button>
            </div>
            <div class="popover-body">
              <div class="audio-row">
                <span class="label">状态:</span>
                <button class="btn-toggle-play inactive" id="btnAudioTogglePlay" onclick="toggleAudio()">
                  静音中 (点击播放)
                </button>
              </div>
              <div class="audio-row volume-row">
                <span class="label">音量:</span>
                <input type="range" min="0" max="100" value="${Math.round(this.volume * 100)}" id="audioVolumeSlider" class="volume-slider" oninput="onAudioVolumeChange(this.value)">
                <span class="volume-num" id="audioVolumeNum">${Math.round(this.volume * 100)}%</span>
              </div>
              <div class="theme-select-section">
                <div class="section-subtitle">曲风意境</div>
                <div class="theme-pills">
                  ${Object.keys(THEMES).map(k => `
                    <button class="theme-pill ${this.currentThemeKey === k ? 'active' : ''}" data-theme="${k}" onclick="onAudioThemeClick('${k}')">
                      ${THEMES[k].name}
                    </button>
                  `).join('')}
                </div>
                <div class="theme-desc" id="audioThemeDesc">${THEMES[this.currentThemeKey].desc}</div>
              </div>
            </div>
          </div>
        `;

        if (profileIcon) {
          topBar.insertBefore(wrap, profileIcon);
        } else {
          topBar.appendChild(wrap);
        }
      }

      this.bindEvents();
      this.updateUI();
    }

    bindEvents() {
      const btn = document.getElementById("audioBtn");
      const popover = document.getElementById("audioPopover");

      // 点击外部关闭浮层
      document.addEventListener("click", (e) => {
        const widget = document.getElementById("audioWidget");
        if (widget && !widget.contains(e.target)) {
          this.togglePopover(false);
        }
      });

      // 右键按钮直接打开面板
      if (btn) {
        btn.addEventListener("contextmenu", (e) => {
          e.preventDefault();
          this.togglePopover();
        });
      }
    }

    togglePopover(forceState) {
      const popover = document.getElementById("audioPopover");
      if (!popover) return;
      const isVisible = popover.style.display !== "none";
      const next = typeof forceState === "boolean" ? forceState : !isVisible;
      popover.style.display = next ? "block" : "none";
    }

    updateUI() {
      const btn = document.getElementById("audioBtn");
      const icon = document.getElementById("audioIcon");
      const togglePlayBtn = document.getElementById("btnAudioTogglePlay");
      const slider = document.getElementById("audioVolumeSlider");
      const volNum = document.getElementById("audioVolumeNum");
      const themeDesc = document.getElementById("audioThemeDesc");
      const pills = document.querySelectorAll(".theme-pill");

      const active = this.isPlaying && !this.isMuted && this.volume > 0;

      if (btn) {
        btn.classList.toggle("playing", active);
        btn.classList.toggle("muted", !active);
      }

      if (icon) {
        icon.textContent = active ? "🎵" : "🔇";
      }

      if (togglePlayBtn) {
        togglePlayBtn.textContent = active ? "仙乐长鸣 (点击静音)" : "静音中 (点击播放)";
        togglePlayBtn.className = "btn-toggle-play " + (active ? "active" : "inactive");
      }

      if (slider) {
        slider.value = Math.round(this.volume * 100);
      }

      if (volNum) {
        volNum.textContent = Math.round(this.volume * 100) + "%";
      }

      if (themeDesc && THEMES[this.currentThemeKey]) {
        themeDesc.textContent = THEMES[this.currentThemeKey].desc;
      }

      pills.forEach(p => {
        const k = p.getAttribute("data-theme");
        p.classList.toggle("active", k === this.currentThemeKey);
      });
    }
  }

  // 挂载全局实例
  const engine = new XianxiaAudioEngine();
  window.xianxiaAudio = engine;

  // 全局交互函数供 HTML 调用
  window.onAudioBtnClick = function (e) {
    if (e) {
      // 如果点击的是右下角齿轮，不触发静音切换
      if (e.target && e.target.classList.contains("audio-gear")) {
        return;
      }
    }
    engine.toggleMute();
  };

  window.openAudioSettings = function (e, forceState) {
    if (e) e.stopPropagation();
    engine.togglePopover(forceState);
  };

  window.toggleAudio = function () {
    engine.toggleMute();
  };

  window.onAudioVolumeChange = function (val) {
    engine.setVolume(val / 100);
  };

  window.onAudioThemeClick = function (themeKey) {
    engine.setTheme(themeKey);
  };
})();

