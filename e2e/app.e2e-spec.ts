import { WalatPage } from './app.po';

describe('walat App', () => {
  let page: WalatPage;

  beforeEach(() => {
    page = new WalatPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
