import { LipSyncAnalyzeResult } from './lipSyncAnalyzeResult'
import homeStore from '@/features/stores/home'

const TIME_DOMAIN_DATA_LENGTH = 2048

export class LipSync {
  public readonly audio: AudioContext
  public readonly analyser: AnalyserNode
  public readonly timeDomainData: Float32Array
  private currentSource: AudioBufferSourceNode | null = null

  public constructor(audio: AudioContext) {
    this.audio = audio

    this.analyser = audio.createAnalyser()
    this.timeDomainData = new Float32Array(TIME_DOMAIN_DATA_LENGTH)
    this.currentSource = null
  }

  public update(): LipSyncAnalyzeResult {
    this.analyser.getFloatTimeDomainData(this.timeDomainData)

    let volume = 0.0
    for (let i = 0; i < TIME_DOMAIN_DATA_LENGTH; i++) {
      volume = Math.max(volume, Math.abs(this.timeDomainData[i]))
    }

    // cook
    volume = 1 / (1 + Math.exp(-45 * volume + 5))
    if (volume < 0.1) volume = 0

    return {
      volume,
    }
  }

  public async playFromArrayBuffer(
    buffer: ArrayBuffer,
    onStart?: () => void,
    isNeedDecode: boolean = true,
    onEnd?: () => void,
    sampleRate: number = 16000
    // sampleRate: number = 24000
  ) {
    try {
      // 如果有正在播放的音頻，先停止它
      if (this.currentSource) {
        this.currentSource.stop()
        this.currentSource.disconnect()
        this.currentSource = null
      }

      // 確保 AudioContext 處於運行狀態
      if (this.audio.state === 'suspended') {
        await this.audio.resume()
      }

      let audioBuffer: AudioBuffer

      // PCM16形式かどうかを判断
      // const isPCM16 = this.detectPCM16(buffer)

      if (!isNeedDecode) {
        // PCM16形式の場合
        const pcmData = new Int16Array(buffer)
        // console.log('PCM data length:', pcmData.length)

        const floatData = new Float32Array(pcmData.length)
        for (let i = 0; i < pcmData.length; i++) {
          floatData[i] =
            pcmData[i] < 0 ? pcmData[i] / 32768.0 : pcmData[i] / 32767.0
        }

        audioBuffer = this.audio.createBuffer(1, floatData.length, sampleRate)
        // audioBuffer = this.audio.createBuffer(1, floatData.length, 16000)
        audioBuffer.getChannelData(0).set(floatData)
      } else {
        // 通常の圧縮音声ファイルの場合
        try {
          audioBuffer = await this.audio.decodeAudioData(buffer)
        } catch (decodeError) {
          console.error('Failed to decode audio data:', decodeError)
          throw new Error('The audio data could not be decoded')
        }
      }

      const bufferSource = this.audio.createBufferSource()
      this.currentSource = bufferSource
      bufferSource.buffer = audioBuffer

      bufferSource.connect(this.audio.destination)
      bufferSource.connect(this.analyser)
      // const gainNode = this.audio.createGain()
      // gainNode.gain.value = 1.0
      // bufferSource.connect(gainNode)
      // gainNode.connect(this.audio.destination)
      // gainNode.connect(this.analyser)

      console.log('Starting audio playback...')
      bufferSource.start()
      onStart?.()

      // 設置結束回調
      bufferSource.onended = () => {
        this.currentSource = null
        onEnd?.()
        console.log('Stop audio playback...')
      }

      // 監聽播放狀態
      const checkState = () => {
        const state = homeStore.getState()
        if (!state.audioPlaying && this.currentSource) {
          this.currentSource.stop()
          this.currentSource.disconnect()
          this.currentSource = null
          onEnd?.()
        }
      }

      const interval = setInterval(() => {
        if (!this.currentSource) {
          clearInterval(interval)
        } else {
          checkState()
        }
      }, 100)
    } catch (error) {
      console.error('Failed to play audio:', error)
      this.currentSource = null
      onEnd?.()
    }
  }

  public async playFromURL(url: string, onEnded?: () => void) {
    const res = await fetch(url)
    const buffer = await res.arrayBuffer()
    this.playFromArrayBuffer(buffer, onEnded)
  }

  // PCM16形式かどうかを判断するメソッド
  private detectPCM16(buffer: ArrayBuffer): boolean {
    // バッファサイズが偶数であることを確認
    if (buffer.byteLength % 2 !== 0) {
      return false
    }

    // サンプルデータの範囲をチェック
    const int16Array = new Int16Array(buffer)
    let isWithinRange = true
    for (let i = 0; i < Math.min(1000, int16Array.length); i++) {
      if (int16Array[i] < -32768 || int16Array[i] > 32767) {
        isWithinRange = false
        break
      }
    }

    // データの分布を簡単にチェック
    let nonZeroCount = 0
    for (let i = 0; i < Math.min(1000, int16Array.length); i++) {
      if (int16Array[i] !== 0) {
        nonZeroCount++
      }
    }

    // 少なくともデータの10%が非ゼロであることを確認
    const hasReasonableDistribution =
      nonZeroCount > Math.min(1000, int16Array.length) * 0.1

    return isWithinRange && hasReasonableDistribution
  }

  public stopAllActiveSources(): void {
    if (this.currentSource) {
      this.currentSource.stop()
      this.currentSource.disconnect()
      this.currentSource = null
    }
  }
}
