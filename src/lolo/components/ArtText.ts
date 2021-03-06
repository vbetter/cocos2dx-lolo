/// <reference path="../display/DisplayObjectContainer.ts"/>


namespace lolo {


    /**
     * 美术字文本框（单行）
     * 根据 text 内容，逐个字符显示对应的 Bitmap
     * 例如：
     *    prefix = "public.artText.num1"
     *    text = "+1"
     *    将会创建两个 BitmapSprite，
     *    sourceName = "public.artText.num1.+" 和 "public.artText.num1.1"
     * @author LOLO
     */
    export class ArtText extends DisplayObjectContainer {

        /**设置的文本内容*/
        protected _text: string;
        /**用于设置字符 BitmapSprite.sourceName 的前缀*/
        protected _prefix: string;

        /**水平对齐方式，默认值：Constants.ALIGN_LEFT，可选值[Constants.ALIGN_LEFT, Constants.ALIGN_CENTER, Constants.ALIGN_RIGHT]*/
        protected _align: string = "left";
        /**垂直对齐方式，默认值：Constants.VALIGN_TOP，可选值[Constants.VALIGN_TOP, Constants.VALIGN_MIDDLE, Constants.VALIGN_BOTTOM]*/
        protected _valign: string = "top";

        /**字符间距*/
        protected _spacing: number = 0;

        /**渲染回调*/
        protected _renderHandler: Handler;


        public constructor() {
            super();

            this._renderHandler = new Handler(this.doRender, this);
        }


        /**
         * 更新显示内容（在 Event.PRERENDER 事件中更新）
         */
        public render(): void {
            PrerenderScheduler.add(this._renderHandler);
        }

        /**
         * 立即更新显示内容，而不是等待 Event.PRERENDER 事件更新
         */
        public renderNow(): void {
            this.doRender();
        }

        /**
         * 进行渲染
         */
        protected doRender(): void {
            PrerenderScheduler.remove(this._renderHandler);
            if (this._prefix == null || this._text == null) return;

            //创建并显示对应的字符 Bitmap
            let count: number, len: number, children: cc.Node[];
            children = this.getChildren();
            len = this._text.length;
            count = children.length;
            if (count > len) {
                while (count > len) {
                    count--;
                    CachePool.recycle(children[count]);
                }
            }
            else if (len > count) {
                while (len > count) {
                    count++;
                    this.addChild(CachePool.getBitmap());
                }
            }

            children = this.getChildren();
            let i: number, bs: Bitmap, len: number = this._text.length, w: number = 0;
            for (i = 0; i < len; i++) {
                bs = <Bitmap>children[i];
                bs.sourceName = this._prefix + "." + this._text.charAt(i);

                if (i != 0) w += this._spacing;
                bs.x = w;
                bs.y = 0;
                w += bs.width;
            }


            // 根据对齐方式确定最终的位置
            if (this._align == Constants.ALIGN_CENTER) w = -w / 2;
            else if (this._align == Constants.ALIGN_RIGHT) w = -w;
            else w = 0;

            let h: number = children[0].height;
            if (this._valign == Constants.VALIGN_MIDDLE) h = -h / 2;
            else if (this._valign == Constants.VALIGN_BOTTOM) h = -h;
            else h = 0;

            for (i = 0; i < len; i++) {
                if (w != 0) children[i].x += w;
                if (h != 0) children[i].y += h;
            }

            this.event_dispatch(new Event(Event.CHILD_RESIZE), true);
        }


        /**
         * 内容
         * 将会根据内容，个字符显示对应的 Bitmap
         */
        public set text(value: string) {
            this._text = value;
            this.render();
        }

        public get text(): string {
            return this._text;
        }


        /**
         * 用于设置字符 Bitmap.sourceName 的前缀
         */
        public set prefix(value: string) {
            this._prefix = value;
            this.render();
        }

        public get prefix(): string {
            return this._prefix;
        }


        /**
         * 水平对齐方式，默认值：Constants.ALIGN_LEFT，可选值[Constants.ALIGN_LEFT, Constants.ALIGN_CENTER, Constants.ALIGN_RIGHT]
         */
        public set align(value: string) {
            if (value == this._align) return;
            this._align = value;
            this.render();
        }

        public get align(): string {
            return this._align;
        }


        /**
         * 垂直对齐方式，默认值：Constants.VALIGN_TOP，可选值[Constants.VALIGN_TOP, Constants.VALIGN_MIDDLE, Constants.VALIGN_BOTTOM]
         */
        public set valign(value: string) {
            if (value == this._valign) return;
            this._valign = value;
            this.render();
        }

        public get valign(): string {
            return this._valign;
        }


        /**
         * 字符间距
         */
        public set spacing(value: number) {
            this._spacing = value;
            this.render();
        }

        public get spacing(): number {
            return this._spacing;
        }


        //


        /**
         * 清空
         */
        public clean(): void {
            PrerenderScheduler.remove(this._renderHandler);
            let children: cc.Node[] = this.getChildren();
            for (let i = 0; i < children.length; i++) {
                CachePool.recycle(children[i]);
            }
        }


        /**
         * 销毁
         */
        public destroy(): void {
            this.clean();

            super.destroy();
        }


        //
    }
}