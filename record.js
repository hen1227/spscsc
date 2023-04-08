class CanvasRecorder {

    constructor() {
        this.frames = [];
        this.isRecording = false;
        this.latestSave = 0;
    }

    recordFrame = () => {
        if(this.isRecording) {
            let canvas = document.getElementById('defaultCanvas0');
            this.frames.push(canvas.toDataURL('image/png'));
            let len = this.frames.length % 100
            if(len === 0) {
                print("Saving Frames upto " + this.frames.length);
                this.saveFramesAsZip(this.frames.length);
            }
        }
    }

    toggleRecording = () => {
        this.isRecording = !this.isRecording;
        if(this.isRecording){
            this.startRecording()
        }else if(!this.isRecording){
            this.stopRecording()
        }
    }

    startRecording = () => {
        print("Started Recording");
        this.isRecording = true;
    }

    stopRecording = () => {
        print("Finished Recording!");
        print("Saving ZIP with " + this.frames.length + " frames");
        this.isRecording = false;
        this.saveFramesAsZip();
        this.frames = [];
        this.latestSave = 0;
    }

    // Save frames as a .zip file
    async saveFramesAsZip(end = this.frames.length) {
        let zip = new JSZip();
        let folder = zip.folder('frames-' + end);

        for (let i = this.latestSave; i < end; i++) {
            const dataURI = this.frames[i];
            const dataBlob = await this.dataURIToBlob(dataURI);
            folder.file(`${zeroPad(i,4)}.png`, dataBlob, { binary: true });
        }

        zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, 'simulation_frames-'+ end + '.zip');
        });

        this.latestSave = end;
    }

    // Helper function to convert data URI to Blob
    dataURIToBlob(dataURI) {
        const binary = atob(dataURI.split(',')[1]);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            array[i] = binary.charCodeAt(i);
        }
        return new Blob([array], { type: 'image/png' });
    }
}

function zeroPad(num, places) {
    let zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
}
