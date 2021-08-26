import { LightningElement ,track,wire} from 'lwc';
import getObjectName from '@salesforce/apex/QueryBuilder.getObjectName';
import getFields from '@salesforce/apex/QueryBuilder.getFields';
import getQueryResults from '@salesforce/apex/QueryBuilder.getQueryResults';


export default class workbenchLWC extends LightningElement {
    value;
    options = [];
    objects = [];
    fields = [];
    queryText = '';
    @track disableButton=true;

    // get disableButton() {
    //     return this._disableButton;
    // }

    _selected = [];


    data = [];
    columns;
    columnsVar =[]; // to store value in coulmns, we need to create an empty list as columns is not iterable

    connectedCallback() {
        getObjectName()
            .then(result => {
                this.objects = result;
                for (let o in this.objects) {
                    this.options = [...this.options, { label: this.objects[o], value: this.objects[o] }];
                }
            })
            .catch(error => {
                // Handle error. Details in error.message.
                console.log(error);
            });
    }
    
    get options() {
        return this.options;
        // return [
        //     { label: 'New', value: 'new' },
        //     { label: 'In Progress', value: 'inProgress' },
        //     { label: 'Finished', value: 'finished' },
        // ];
    }

    handleChange(event) {
        this.value = event.detail.value;
        this.fields = []; //rerender
        this.queryText = ''; //rerender
        this.columns = []; //rerender
        this.data = []; //rerender
        this._selected = []; //rerender
        this.disableButton = true; //rerender
        getFields({sObjectAPIName : this.value})
            .then(result => {
                for (let field in result) {
                    this.fields = [...this.fields, { label: result[field], value: result[field] }];

                }
            })
            .catch(error => {
                console.log(error);
            });
    }

    
    get FieldOptions() {
        return this.fields;
    }

    get selected() {
        return this._selected.length ? this._selected : 'none';
    }

    handleFieldChange(e) {
        this._selected = e.detail.value;
        this.queryText = ''; //rerender
        this.columns = []; //rerender
        this.data = []; //rerender
        if(this._selected.length){
            this.disableButton = false;
            this.queryText += "SELECT ";
            let selectedValues = this._selected;
            for (let i = 0; i < selectedValues.length; i++) {
                if (i == selectedValues.length - 1) {
                    this.queryText += selectedValues[i];
                    break;
                }
                this.queryText += selectedValues[i] + ", ";
            }
            this.queryText += " FROM " + this.value;
        }else{
            this.disableButton = true;
        }
        
    }

    clickedButtonLabel;

    

    getResult(event) {
        this.clickedButtonLabel = event.target.label;
        this.columnsVar = []; //rerender
        this.data = []; //rerender
        getQueryResults({query : this.queryText, selectedValues : this._selected})
        .then(result => {
            for (let col in this._selected) {
                this.columnsVar = [...this.columnsVar, { label: this._selected[col], fieldName: this._selected[col] }];

            }
            this.columns = this.columnsVar;
            this.data = result;
            // console.log(result);
            // for(let i = 0; i < result.length; i++){
            //     for(let j = 0; j < this._selected.length; j++){
            //         this.data.add(result[i][j]);
            //     }
            // }
        })
    }

    

    // eslint-disable-next-line @lwc/lwc/no-async-await
}
