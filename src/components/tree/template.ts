class Template {
  monacoIconLabel: HTMLElement;

  label: HTMLElement;

  description: HTMLElement;

  /**
   *Creates an instance of Template.
   * @param {HTMLElement} container
   * @memberof Template
   */
  constructor(container: HTMLElement) {
    this.monacoIconLabel = document.createElement('div');
    this.monacoIconLabel.className = 'monaco-icon-label';
    this.monacoIconLabel.style.display = 'flex';
    container.appendChild(this.monacoIconLabel);

    const labelDescriptionContainer = document.createElement('div');
    labelDescriptionContainer.className = 'monaco-icon-label-description-container';
    this.monacoIconLabel.appendChild(labelDescriptionContainer);

    this.label = document.createElement('a');
    this.label.className = 'label-name';
    labelDescriptionContainer.appendChild(this.label);

    labelDescriptionContainer.style.overflow = 'hidden';
    labelDescriptionContainer.style.textOverflow = 'ellipsis';
    labelDescriptionContainer.style.whiteSpace = 'nowrap';

    this.description = document.createElement('span');
    this.description.className = 'label-description';
    labelDescriptionContainer.appendChild(this.description);
  }
}

export default Template;
