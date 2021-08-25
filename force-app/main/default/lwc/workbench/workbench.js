import { LightningElement ,wire} from 'lwc';
import getObjectName from '@salesforce/apex/QueryBuilder.getObjectName';
import getFields from '@salesforce/apex/QueryBuilder.getFields';
import getQueryResults from '@salesforce/apex/QueryBuilder.getQueryResults';

export default class workbenchLWC extends LightningElement {
    value;
    options = [];
    objects = [];
    fields = [];
    queryText = '';
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
        this.queryText = '';
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

    _selected = [];

    get FieldOptions() {
        return this.fields;
    }

    get selected() {
        return this._selected.length ? this._selected : 'none';
    }

    handleFieldChange(e) {
        this._selected = e.detail.value;
        this.queryText = '';
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
    }

    clickedButtonLabel;

    getResult(event) {
        this.clickedButtonLabel = event.target.label;
        getQueryResults({query : this.queryText, selectedValues : this._selected})
        .then(result => {

        })
    }
}
