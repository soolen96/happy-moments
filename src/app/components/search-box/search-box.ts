import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-box',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-box.html',
  styleUrl: './search-box.css',
})
export class SearchBoxComponent {
  @Input() searchQuery = '';
  @Output() searchQueryChange = new EventEmitter<string>();

  @Input() categories: string[] = [];
  @Input() selectedCategory = 'Todos';
  @Output() categoryChange = new EventEmitter<string>();

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQueryChange.emit(value);
  }

  selectCategory(category: string) {
    this.categoryChange.emit(category);
  }
}
