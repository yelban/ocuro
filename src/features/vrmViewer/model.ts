import * as THREE from 'three'
import {
  VRM,
  VRMExpressionPresetName,
  VRMLoaderPlugin,
  VRMUtils,
} from '@pixiv/three-vrm'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { VRMAnimation } from '../../lib/VRMAnimation/VRMAnimation'
import { VRMLookAtSmootherLoaderPlugin } from '@/lib/VRMLookAtSmootherLoaderPlugin/VRMLookAtSmootherLoaderPlugin'
import { LipSync } from '../lipSync/lipSync'
import { EmoteController } from '../emoteController/emoteController'
import { Screenplay } from '../messages/messages'
import homeStore from '@/features/stores/home'

/**
 * 3Dキャラクターを管理するクラス
 */
export class Model {
  public vrm?: VRM | null
  public mixer?: THREE.AnimationMixer
  public emoteController?: EmoteController
  public lipSync?: LipSync

  private _lookAtTargetParent: THREE.Object3D
  private _lipSync?: LipSync

  constructor(lookAtTargetParent: THREE.Object3D) {
    this._lookAtTargetParent = lookAtTargetParent
    this._lipSync = new LipSync(new AudioContext())
    this.lipSync = this._lipSync
  }

  public async loadVRM(url: string): Promise<void> {
    const loader = new GLTFLoader()
    loader.register(
      (parser) =>
        new VRMLoaderPlugin(parser, {
          lookAtPlugin: new VRMLookAtSmootherLoaderPlugin(parser),
        })
    )

    const gltf = await loader.loadAsync(url)

    const vrm = (this.vrm = gltf.userData.vrm)
    vrm.scene.name = 'VRMRoot'

    VRMUtils.rotateVRM0(vrm)
    this.mixer = new THREE.AnimationMixer(vrm.scene)

    this.emoteController = new EmoteController(vrm, this._lookAtTargetParent)
  }

  public unLoadVrm() {
    if (this.vrm) {
      VRMUtils.deepDispose(this.vrm.scene)
      this.vrm = null
    }
  }

  /**
   * VRMアニメーションを読み込む
   *
   * https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm_animation-1.0/README.ja.md
   */
  public async loadAnimation(vrmAnimation: VRMAnimation): Promise<void> {
    const { vrm, mixer } = this
    if (vrm == null || mixer == null) {
      throw new Error('You have to load VRM first')
    }

    const clip = vrmAnimation.createAnimationClip(vrm)
    const action = mixer.clipAction(clip)
    action.play()
  }

  /**
   * 音声を再生し、リップシンクを行う
   */
  public async speak(
    buffer: ArrayBuffer,
    screenplay: Screenplay,
    isNeedDecode: boolean = true
  ) {
    homeStore.setState({ audioPlaying: true })

    this.emoteController?.playEmotion(screenplay.expression)

    try {
      await new Promise((resolve) => {
        this.lipSync?.playFromArrayBuffer(
          buffer,
          () => {
            console.log('Audio playback started')
          },
          isNeedDecode,
          () => {
            console.log('Audio playback ended')
            homeStore.setState({ audioPlaying: false })
            resolve(true)
          }
        )
      })
    } catch (error) {
      homeStore.setState({ audioPlaying: false })
      console.error('Error in speak:', error)
    }
  }

  /**
   * 播放表情動作
   * @param preset - 表情預設值
   * - 'neutral' - 一般表情
   * - 'happy' - 開心表情
   * - 'angry' - 生氣表情
   * - 'sad' - 悲傷表情
   * - etc...
   * @throws Error 當 emoteController 未初始化時
   * @returns Promise<void>
   */
  public async playEmotion(preset: VRMExpressionPresetName): Promise<void> {
    if (!this.emoteController) {
      throw new Error(
        'EmoteController is not initialized. Please load VRM first.'
      )
    }
    this.emoteController.playEmotion(preset)
  }

  public update(delta: number): void {
    if (this.lipSync) {
      const { volume } = this.lipSync.update()
      this.emoteController?.lipSync('aa', volume)
    }

    this.emoteController?.update(delta)
    this.mixer?.update(delta)
    this.vrm?.update(delta)
  }
}
