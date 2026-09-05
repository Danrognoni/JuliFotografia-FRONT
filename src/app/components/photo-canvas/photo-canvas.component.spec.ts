import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhotoCanvasComponent } from './photo-canvas.component';
import { CanvasPhoto } from '../../models/canvas-photo.model';

describe('PhotoCanvasComponent', () => {
  let component: PhotoCanvasComponent;
  let fixture: ComponentFixture<PhotoCanvasComponent>;

  const mockPhotos: CanvasPhoto[] = [
    {
      id: 'photo-1',
      url: 'https://example.com/photo1.jpg',
      title: 'Foto 1',
      caption: 'Paisaje',
      x: 100,
      y: 120,
      width: 400,
      height: 500,
      zIndex: 1,
      orientation: 'portrait'
    },
    {
      id: 'photo-2',
      url: 'https://example.com/photo2.jpg',
      title: 'Foto 2',
      caption: 'Retrato',
      x: 350,
      y: 200,
      width: 500,
      height: 350,
      zIndex: 2,
      orientation: 'landscape'
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoCanvasComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoCanvasComponent);
    component = fixture.componentInstance;
    component.photos = mockPhotos;
    fixture.detectChanges();
  });

  it('should create the PhotoCanvasComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should load photos with their predefined coordinates', () => {
    const list = component.photosList();
    expect(list.length).toBe(2);
    expect(list[0].x).toBe(100);
    expect(list[0].y).toBe(120);
    expect(list[0].width).toBe(400);
    expect(list[0].height).toBe(500);
  });

  it('should toggle edit mode correctly', () => {
    expect(component.isEditMode()).toBe(false);
    component.toggleEditMode();
    expect(component.isEditMode()).toBe(true);
    component.toggleEditMode();
    expect(component.isEditMode()).toBe(false);
  });

  it('should elevate zIndex when bringToFront is invoked', () => {
    const photo = component.photosList()[0];
    const initialZ = photo.zIndex;
    component.bringToFront(photo);
    expect(photo.zIndex).toBeGreaterThan(initialZ);
    expect(component.hasUnsavedChanges()).toBe(true);
  });

  it('should emit saveLayout payload with consolidated coordinates', () => {
    let emittedPayload: any = null;
    component.saveLayout.subscribe(payload => {
      emittedPayload = payload;
    });

    component.onSaveLayout();
    expect(emittedPayload).toBeTruthy();
    expect(emittedPayload.length).toBe(2);
    expect(emittedPayload[0].id).toBe('photo-1');
    expect(emittedPayload[0].x).toBe(100);
    expect(emittedPayload[0].y).toBe(120);
    expect(emittedPayload[0].width).toBe(400);
    expect(emittedPayload[0].height).toBe(500);
    expect(component.isSaving()).toBe(true);
  });

  it('should rollback changes when discard changes is triggered', () => {
    component.toggleEditMode(); // Creates backup
    const photo = component.photosList()[0];
    photo.x = 999;
    photo.y = 888;
    component.photosList.update(list => [...list]);
    component.hasUnsavedChanges.set(true);

    component.onDiscardChanges();
    expect(component.photosList()[0].x).toBe(100);
    expect(component.photosList()[0].y).toBe(120);
    expect(component.hasUnsavedChanges()).toBe(false);
  });
});
