import { html, css, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { VRM } from '@pixiv/three-vrm'

@customElement("app-model")
export class AppViewModel extends LitElement{
    static styles = css`
        :host{
            width: 100vw;
            height: 100vh;
            display: flex;
            overflow-x: hidden;
            position: relative;
        }
        :host #cloud{
            position: absolute;
            width: 100vw;
            height: 100vh;
            z-index: 2;
            width: 100vw;
            height: 100vh;
        }
        :host .background{
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.7);
        }
        :host app-cloud{
            position: absolute;
            top: 10%;
            bottom: 0;
            left: 10%;
            width: 80%;
            height: 80%;
        }
        :host .hidden{
            display: none;
        }
        :host .show{
            display: block;
        }
        :host #preview{
            width: 40%;
            height: 100%;
            text-align: center;
        }
        :host button{
            margin: 5px 3px;
        }
        :host #settings{
            padding: 0 10px;
            width: 60%;
            height: 100%;
            overflow-y: scroll;
        }
        :host #preview #wrapper{
            margin: 5px 0;
        }
        :host #preview #model {
            background-color: #e9e4d3;
            position: relative;
            width: 100%;
        }
        :host #preview #model:before {
            content: "";
            display: block;
            padding-top: 110.07%;
        }
        :host #preview #model canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        }
        :host #preview #loadModel{
            display: none;
        }
        :host #search{
            border: 1px solid black;
            border-radius: 4px;
            margin: 4px 5%;
            font-size: 20px;
            width: 90%;
            height: 40px;
        }
        :host #settings details{
            border: 1px solid black;
            padding: 5px;
            border-radius: 4px;
            margin: 4px;
        }
        :host #settings details div{
            margin-left: 20px;
        }
        :host #settings details div input{
            margin-left: 5px;
        }
        :host footer{
            text-align: center;
            margin-top: 5px;
        }
    `

    @state()
    pose!:Object

    @state()
    vrm!:VRM

    @state()
    modelPose: any = []

    @state()
    renderModel!: any

    @state()
    language:{[index:string]: {[index:string]: string}} = {
        "ja": {
            chest: "胸",
            head: "頭",
            hips: "尻",
            jaw: "顎",
            leftEye: "左目",
            leftFoot: "左足",
            leftHand: "左手",
            leftIndexDistal: "左人差し指第三指骨",
            leftIndexIntermediate: "左人差し指第二指骨",
            leftIndexProximal: "左人差し指第一指骨",
            leftLittleDistal: "左小指第三指骨",
            leftLittleIntermediate: "左小指第二指骨",
            leftLittleProximal: "左小指第一指骨",
            leftLowerArm: "左ひじ",
            leftLowerLeg: "左ひざ",
            leftMiddleDistal: "左中指第三指骨",
            leftMiddleIntermediate: "左中指第二指骨",
            leftMiddleProximal: "左中指第一指骨",
            leftRingDistal: "左薬指第三指骨",
            leftRingIntermediate: "左薬指第二指骨",
            leftRingProximal: "左薬指第一指骨",
            leftShoulder: "左肩",
            leftThumbDistal: "左親指第三指骨",
            leftThumbIntermediate: "左親指第二指骨",
            leftThumbProximal: "左親指第一指骨",
            leftToes: "左つま先",
            leftUpperArm: "左上腕",
            leftUpperLeg: "左太もも",
            neck: "首",
            rightEye: "右目",
            rightFoot: "右足",
            rightHand: "右手",
            rightIndexDistal: "右人差し指第三指骨",
            rightIndexIntermediate: "右人差し指第二指骨",
            rightIndexProximal: "右人差し指第一指骨",
            rightLittleDistal: "右小指第三指骨",
            rightLittleIntermediate: "右小指第二指骨",
            rightLittleProximal: "右小指第一指骨",
            rightLowerArm: "右ひじ",
            rightLowerLeg: "右ひざ",
            rightMiddleDistal: "右中指第三指骨",
            rightMiddleIntermediate: "右中指第二指骨",
            rightMiddleProximal: "右中指第一指骨",
            rightRingDistal: "右薬指第三指骨",
            rightRingIntermediate: "右薬指第二指骨",
            rightRingProximal: "右薬指第一指骨",
            rightShoulder: "右肩",
            rightThumbDistal: "右親指第三指骨",
            rightThumbIntermediate: "右親指第二指骨",
            rightThumbProximal: "右親指第一指骨",
            rightToes: "右つま先",
            rightUpperArm: "右上腕",
            rightUpperLeg: "右太もも",
            spine: "背骨",
            upperChest: "上胸",
            rotation: "回転",
            position: "位置"
        }
    }

    @state()
    camera!: any

    @state()
    searchString!: string

    protected firstUpdated(): void {
        // canvasの取得
        const canvas = this.shadowRoot!.getElementById('model')!

        // シーンの生成
        const scene = new THREE.Scene()

        // カメラの生成
        const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000)
        camera.position.set(0, 0.8, -2.5)
        camera.rotation.set(0, Math.PI, 0)
        this.camera = camera

        // レンダラーの生成
        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            preserveDrawingBuffer: true 
        })
        renderer.setPixelRatio(window.devicePixelRatio * 4)
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        canvas.appendChild(renderer.domElement)

        // ライトの生成
        const light = new THREE.DirectionalLight(0xffffff)
        light.position.set(-1, 1, -1).normalize()
        scene.add(light)

        const controls = new OrbitControls(camera, renderer.domElement)
        controls.screenSpacePanning = false
        controls.target.set(0.0, 0.8, 0.0)
        controls.update()

        const loader = new GLTFLoader()
        loader.load("models/model.vrm",
            (gltf) => {
                VRM.from(gltf).then( (vrm: VRM) => {
                    scene.add(vrm.scene)
                    this.modelPose = vrm.humanoid?.getPose()
                    this.vrm = vrm
                })
            }
        )

        // フレーム毎に呼ばれる
        const update = () => {
            requestAnimationFrame(update)
            renderer.render(scene, camera)
        }
        update()
    }

    protected render(){
        return html`
            <div id="preview">
                <div id="wrapper">
                    <div id="model"></div>
                </div>
                <button
                    @click=${this.downloadModelImage}
                    class="margin"
                >画像のダウンロード</button>
                <button
                    @click=${this.downloadSettings}
                    class="margin"
                >ポーズのダウンロード</button>
                <input
                    id="loadModel"
                    type="file"
                    accept=",.json"
                    @change=${this.loadSettingsFile}
                >
                <button
                    @click=${this.loadSettings}
                >ポーズの読み込み</button>
                <br>
                <button
                    @click=${this.resetCamera}
                >視点のリセット</button>
                <button
                    @click=${this.reset}
                >ポーズのリセット</button>
            </div>
            <div id="settings">
                <input
                    id="search"
                    placeholder="検索"
                    @change=${this.search}
                >
                ${Object.keys(this.modelPose).map((part: string)=>{
                    const regexp = new RegExp(this.searchString, "g")
                    if(!regexp.test(this.language["ja"][part]) && !regexp.test(part)) return
                    return html`
                        <details>
                            <summary>${this.language["ja"][part]}:</summary>
                            ${Object.keys(this.modelPose[part]).map((key:string)=>{
                                return html`
                                    <div>
                                        <label>${key}:</label>
                                        ${this.modelPose[part][key].map((item: number, index: number)=>{
                                            return html`<input
                                                            class="${part} ${key}"
                                                            data-part=${part}
                                                            data-type=${key}
                                                            data-index=${index}
                                                            @change=${this.onChange}
                                                            type="number"
                                                            value=${key=="rotation"&& index != 3
                                                                ?item*180/Math.PI
                                                                :item}
                                                        >`
                                        })}
                                    </div>
                                `
                            })}
                        </details>
                    `
                })}
                <footer>
                    <p>©️2022 tsubasa652 All Rights Reserved</p>
                </footer>
            </div>
        `
    }

    private onChange(e: Event){
        const target = (<HTMLInputElement>e.target)
        let data:{[index:string]: any} = target.dataset
        this.modelPose[data.part][data.type][data.index] = data.type == "rotation" && Number(data.index) != 4 ? Number(target.value) * Math.PI / 180 :Number(target.value)
        this.vrm.humanoid?.setPose(this.modelPose)
    }

    private search(e:Event){
        const target = <HTMLInputElement>e.target
        this.searchString = target.value
    }

    private downloadModelImage(){
        const canvas = <HTMLCanvasElement>this.shadowRoot?.getElementById("model")?.getElementsByTagName("canvas")[0]
        const content = canvas.toDataURL()
        this.downloadURI(content, "model.png")
    }

    private async downloadSettings(){
        const Obj = new Blob([JSON.stringify(this.modelPose)], {type:"application/json"})
        this.downloadURI(URL.createObjectURL(Obj), "model.json")
    }

    private async loadSettingsFile(e: Event){
        const target = <HTMLInputElement>e.target
        const files = target.files
        if (files!.length === 0) return
        await this.reset()
        const file = files![0]
        if(!/\.json$/g.test(file.name)) {
            alert("ファイル形式が違います。")
            return
        }
        let tmp = JSON.parse(await file.text())
        let keys = ["position", "rotation"]
        for(let i of Object.keys(tmp)){
            for(let j of keys){
                if(Object.keys(tmp[i]).includes(j)){
                    switch(j){
                        case "position":
                            if(tmp[i][j].length != 3 || typeof(tmp[i][j]) != "object") tmp[i] = {
                                [j]: [0,0,0],
                                ...tmp[i]
                            }
                            break
                        case "rotation":
                            if(tmp[i][j].length != 4 || typeof(tmp[i][j]) != "object") tmp[i][j] = [0,0,0,1]
                            break
                    }
                }else{
                    switch(j){
                        case "position":
                            tmp[i] = {
                                [j]: [0,0,0],
                                ...tmp[i]
                            }
                            break
                        case "rotation":
                            tmp[i][j] = [0,0,0,1]
                            break
                    }
                }
            }
        }
        this.modelPose = tmp
        this.vrm.humanoid?.setPose(this.modelPose)
    }

    private loadSettings(){
        const fileSelect = this.shadowRoot?.getElementById("loadModel")
        fileSelect?.click()
    }

    private downloadURI(uri: string, name: string) {
        let link = document.createElement("a")
        link.download = name
        link.href = uri
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    private reset(){
        return new Promise((resolve: any)=>{
            this.resetCamera()
            this.modelPose = {}
            setTimeout(()=>{
                this.vrm.humanoid?.resetPose()
                this.modelPose = this.vrm.humanoid?.getPose()
                resolve()
            }, 10)
        })
    }

    private resetCamera(){
        this.camera.position.set(0, 0.8, -2.5)
        this.camera.rotation.set(0, Math.PI, 0)
    }
}