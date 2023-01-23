import { Injectable } from '@angular/core';
import { EntityServicesBase, EntityServicesElements } from '@ngrx/data';
import { State } from '@ngrx/store';
import { take } from 'rxjs';
import { Entity } from './entity';
import { FormControl } from '@angular/forms';
import { NgxReactFormMethodsService } from '@rom111419/ngx-react-form-methods';


@Injectable({
  providedIn: 'root',
})
export class NgxEntityStateFormGeneratorService extends EntityServicesBase {

  constructor(
    elements: EntityServicesElements,
    protected state: State<any>,
    protected fs: NgxReactFormMethodsService,
  ) {
    super(elements);
  }

  public readItems(entityNames: string[]) {
    const result = {};
    entityNames.forEach(name => {
      const entityCash = this.state.value.entityCache[name];
      if (entityCash) {
        Object.assign(result, { [name]: entityCash?.ids?.map((id: string | number) => entityCash.entities[id]) });
      }
    });
    return result;
  }

  public readItem(entityName: string, entityId: string | number) {
    const entitiesMap = this.state.value.entityCache[entityName]?.entities;
    let result = undefined;
    for (const key in entitiesMap) {
      if (entitiesMap[key].id === entityId) {
        result = { ...entitiesMap[key] };
      }
    }
    return result || '';
  }

  public entityCreate<T>(entityName: string, entity: Record<string, unknown>) {
    const cashEntity = this.getEntityCollectionService(entityName);
    const formControl = this.fs.getArray(`all.${ entityName }`);

    cashEntity.count$.pipe(take(1)).subscribe(count => {
      const result = { id: count + 1, ...entity };
      cashEntity.addOneToCache(result);
      if (!formControl) {
        this.fs.getGroup('all').addControl(entityName, this.fs.fb.array([this.fs.formGeneratorService.run(result)]));
      } else {
        this.fs.getArray(`all.${ entityName }`).push(this.fs.formGeneratorService.run(result));
      }
    });
  }

  public entityDelete(entityName: string, id: string) {
    this.getEntityCollectionService(entityName).removeOneFromCache(id);

    this.fs.getArray(`all.${ entityName }`).controls.find((control: { value: { id: string; }; }, idx: any) =>
      control?.value.id === id ? this.fs.getArray(`all.${ entityName }`).removeAt(idx) : false,
    );
  }

  public entityRead<T>(entityName: string, entityId: string) {
    return this.readItem(entityName, entityId);
  }

  public entityUpdate<T>(entityName: string, value: T & Entity, formGroup?: FormControl) {
    const cashEntity = this.getEntityCollectionService(entityName);
    cashEntity.updateOneInCache(value);
    if (formGroup) {
      formGroup.patchValue(value);
    }
  }

  public entityUpsert<T>(entityName: string, value: T & Entity, formGroup?: FormControl) {
    const cashEntity = this.getEntityCollectionService(entityName);
    cashEntity.upsertOneInCache(value);
    if (formGroup) {
      formGroup.patchValue(value);
    }
  }

  public filterControls(entityName: string, contexts: string[]) {
    this.getEntityCollectionService(entityName).setFilter(contexts);
  }
}
