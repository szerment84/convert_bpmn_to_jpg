<template>
    <div class="m-3">
        <div class="d-flex align-items-center mb-3">
        <img src="/image/pixel1.jpg" alt="Pixel Image" class="me-2" width="50" height="50"> <!-- Ścieżka do obrazu -->
        <input type="file" @change="onFileChange" class="form-control mb-3" />
        </div>
        <button @click="convertToImage" v-if="fileLoaded" class="btn btn-primary mb-3 me-2">Download to image</button>
        <button @click="downloadProcessedBpmn" v-if="fileLoaded" class="btn btn-primary mb-3">Download processed .bpmn</button>

      <div id="bpmnRenderedContainer" class="border mb-3" style="height: 500px; background-color: white;"></div>
    </div>
  </template>
  
  <script>
  import BpmnViewer from 'bpmn-js';
  import domtoimage from 'dom-to-image';
  import { jsPDF } from 'jspdf';
  import { layoutProcess } from 'bpmn-auto-layout';
  
  export default {
    data() {
      return {
        viewer: null,
        fileLoaded: false,
        processedBpmn: null
      };
    },
    mounted() {
      this.viewer = new BpmnViewer({
        container: '#bpmnRenderedContainer',
      });
    },
    methods: {
        onFileChange(e) {
        const file = e.target.files[0];
        if (!file) {
            alert('Please select a file.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            this.processBpmnBeforeLoad(e.target.result); // Zmodyfikowane, aby uwzględnić przetwarzanie
        };
        reader.readAsText(file);
        },

        processBpmnBeforeLoad(bpmnXML) {
            console.log('Processing BPMN XML before load...');
            layoutProcess(bpmnXML).then(layoutedBpmnXML => {
            this.processedBpmn = layoutedBpmnXML; // Zapisz przetworzony BPMN
            this.loadBpmn(layoutedBpmnXML);
            }).catch(error => {
            console.error('Error during BPMN layout processing:', error);
            // W razie błędu, opcjonalnie załaduj oryginalny BPMN
            this.loadBpmn(bpmnXML);
            });
        },

        downloadProcessedBpmn() {
            if (!this.processedBpmn) {
                console.error('No processed BPMN available for download.');
                return;
            }
            const currentDate = new Date().toISOString().replace(/:/g, '-'); 
            const fileName = `processed-bpmn_${currentDate}.bpmn`;
            const blob = new Blob([this.processedBpmn], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },


        loadBpmn(bpmnXML) {
            this.viewer.importXML(bpmnXML).then(({ warnings }) => {
                if (warnings.length) {
                console.warn('Warnings during import:', warnings);
                }
                this.viewer.get('canvas').zoom('fit-viewport');
                this.fileLoaded = true;
            }).catch(err => {
                console.error('Could not import BPMN diagram', err);
                this.fileLoaded = false;
            });
        },

        convertToImage() {
            this.convertToFormat('image');
        },

        convertToPDF() {
            this.convertToFormat('pdf');
        },

        convertToFormat(format) {
            const node = document.getElementById('bpmnRenderedContainer');
            if (!node) {
            console.error('BPMN render container not found.');
            return;
            }
    
            domtoimage.toPng(node)
            .then((dataUrl) => {
                const currentDate = new Date().toISOString().replace(/:/g, '-'); // Zastąp dwukropki, ponieważ nie są dozwolone w nazwach plików
                if (format === 'image') {
                    const fileName = `diagram_${currentDate}.jpg`;
                    const link = document.createElement('a');
                    link.download = fileName;
                    link.href = dataUrl;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else if (format === 'pdf') {
                    const fileName = `diagram_${currentDate}.pdf`;
                    const pdf = new jsPDF();
                    pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297); // Dostosuj rozmiary, jeśli to konieczne
                    pdf.save(fileName);
                }
            })
            .catch((error) => {
                console.error('Something went wrong:', error);
            });

        },

    },
  };
  </script>
  
  <style>
  #bpmnRenderedContainer {
    /* Adjust height as needed for your application */
    height: 500px;
  }
  </style>
  