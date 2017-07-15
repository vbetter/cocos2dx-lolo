namespace lolo {


    /**
     * 按钮容器，实现 touch 缩放效果
     *
     * 使用 ButtonContainer 时，会改变被遮罩对象的显示层级，伪代码如下：
     * var oldParent = target.parent;
     * target.parent = buttonContainer;
     * buttonContainer.parent = oldParent;
     *
     * @author LOLO
     */
    export class ButtonContainer extends DisplayObjectContainer {

        /**Touch Begin 时，播放的音效名称。默认值：null，表示不用播放*/
        public static touchSoundName: string = null;
        /**Touch Begin 时，缩放的比例。值为 1 时，表示不用缩放。默认值：0.9*/
        public static touchZoomScale: number = 0.9;


        /**
         * Touch时，播放的音效名称。
         * 默认将使用 ButtonContainer.touchSoundName 的值
         * 值为 null 时，表示不用播放音效。
         */
        public touchSoundName: string = null;

        /**
         * Touch begin 时，缩放的比例。
         * 默认将使用 ButtonContainer.touchZoomScale 的值。
         * 值为 1 时，表示不用缩放。
         */
        public touchZoomScale: number;

        /**效果应用的目标*/
        private _target: cc.Node;
        private _target_setPositionX: Function;
        private _target_setPositionY: Function;
        private _target_hitTest: Function;


        public constructor(target: cc.Node) {
            super();
            this.touchZoomScale = ButtonContainer.touchZoomScale;
            this.touchSoundName = ButtonContainer.touchSoundName;
            this.target = target;

            this.touchEnabled = true;
            this.touchListener.swallowTouches = false;
            this.event_addListener(TouchEvent.TOUCH_BEGIN, this.bc_touchBegin, this);
        }


        public onExit(): void {
            super.onExit();
            this.setScale(1);
        }


        /**
         * 更新 position 和 scale。
         * 在 target 的 width / height / x / y / scaleX / scaleY 有变化时，请调用该方法
         */
        public update(): void {
            this.childResizeHandler();
        }

        protected childResizeHandler(event?: Event): void {
            this.childResized = true;

            let target: cc.Node = this._target;
            let hw: number = target.width / 2;
            let hh: number = target.height / 2;
            target._original_setPosition(-hw, hh);

            console.log(target.sourceName,target.anchorX, target.anchorY, target.width, target.height);

            this._original_setPosition(this._x + hw, -(this._y + hh));
        }


        /**
         * 效果应用的目标
         */
        public set target(target: cc.Node) {
            this.removeTarget();
            this._target = target;
            if (target == null) return;

            target.parent.addChild(this);
            this.addChild(target);

            this._x = target.x;
            this._y = target.y;
            this.childResizeHandler();

            this._target_setPositionX = target.setPositionX;
            this._target_setPositionY = target.setPositionY;
            this._target_hitTest = target.hitTest;
            target.setPositionX = this.target_setPositionX;
            target.setPositionY = this.target_setPositionY;
            target.hitTest = this.target_hitTest;
        }

        public get target(): cc.Node {
            return this._target;
        }

        private removeTarget(): void {
            let target: cc.Node = this._target;
            if (target != null) {
                this._target = null;
                this.parent.addChild(target);
                this.removeFromParent();

                target.setPositionX = this._target_setPositionX;
                target.setPositionY = this._target_setPositionY;
                target.hitTest = this._target_hitTest;
                target.setPosition(this._x, this._y);
                this._target_setPositionX = this._target_setPositionY = this._target_hitTest = null;
            }
        }

        private target_setPositionX(value: number): void {
            let bc: ButtonContainer = <ButtonContainer>this.parent;
            bc._x = value;
            bc.update();
        }

        private target_setPositionY(value: number): void {
            let bc: ButtonContainer = <ButtonContainer>this.parent;
            bc._y = value;
            bc.update();
        }

        private target_hitTest(worldPoint: cc.Point): boolean {
            return (<ButtonContainer>this.parent).hitTest(worldPoint);
        }


        /**
         * touch begin
         * @param event
         */
        private bc_touchBegin(event: TouchEvent): void {
            this.event_addListener(TouchEvent.TOUCH_END, this.bc_touchEnd, this);

            let scale: number = this.touchZoomScale;
            if (scale != 1) {
                this.stopAllActions();
                this.runAction(cc.scaleTo(0.05, scale));
            }

            // var snd:string = (this.touchSoundName != null) ? this.touchSoundName : BaseButton.touchSoundName;
            // if(snd != null || snd != "") lolo.sound.play(snd);
        }

        /**
         * touch end
         * @param event
         */
        private bc_touchEnd(event: TouchEvent): void {
            this.event_removeListener(TouchEvent.TOUCH_END, this.bc_touchEnd, this);

            let scale: number = this.touchZoomScale;
            if (scale != 1) {
                this.stopAllActions();
                this.runAction(cc.scaleTo(0.05, 1));
            }
        }


        /**
         * 点击测试
         * @param worldPoint
         * @return {boolean}
         */
        public hitTest(worldPoint: cc.Point): boolean {
            if (!this.inStageVisibled(worldPoint)) return false;// 当前节点不可见

            // 当前缩小了，先还原 scale，再测试点击
            let scale: number = this.getScaleX();
            let zooming: boolean = scale < 1;
            if (zooming) this.setScale(1);
            let hitted: boolean = this._target_hitTest.call(this._target, worldPoint);
            if (zooming) this.setScale(scale);
            return hitted;
        }


        //
    }
}