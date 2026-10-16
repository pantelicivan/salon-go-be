export abstract class PushNotification {
  /** Notification's title */
  protected title: string | null;

  /** Notification's body */
  protected body: string | null;

  /** Notifications data. Can be any type of object */
  protected data: any | null;

  /** Notification's topic */
  protected topic: string | null = null;

  /** Notification's receivers (device tokens) */
  protected receivers: string[] | null = null;

  /**
   * Sets notification's title.
   * @param title
   * @returns {PushNotification} - This instance.
   */
  public setTitle(title: string | null): this {
    this.title = title;
    return this;
  }

  /**
   * Gets notification's title.
   * @returns {string} - Notification's title.
   */
  public getTitle(): string | null {
    return this.title;
  }

  /**
   * Sets notification's body.
   * @param body
   * @returns {PushNotification} - This instance.
   */
  public setBody(body: string | null): this {
    this.body = body;
    return this;
  }

  /**
   * Gets notification's body.
   * @returns {string} - Notification's body.
   */
  public getBody(): string | null {
    return this.body;
  }

  /**
   * Sets notification's data.
   * @param data
   * @returns {PushNotification} - This instance.
   */
  public setData(data: any | null): this {
    this.data = data;
    return this;
  }

  /**
   * Gets notification's data.
   * @returns {any | null} - Notification's body.
   */
  public getData(): any | null {
    return this.data;
  }

  /**
   * Sets notification's topic. Unsets notification's receivers.
   * @param topic
   * @returns {PushNotification} - This instance.
   */
  public setTopic(topic: string | null): this {
    this.topic = topic;
    this.receivers = null;
    return this;
  }

  /**
   * Gets notification's topic.
   * @returns {string | null} - Notification's topic.
   */
  public getTopic(): string | null {
    return this.topic;
  }

  /**
   * Sets notification's receivers. Unsets notification's topic.
   * @param receivers
   * @returns {PushNotification} - This instance.
   */
  public setReceivers(receivers: string[] | null): this {
    this.receivers = receivers;
    this.topic = null;
    return this;
  }

  /**
   * Gets notification's receivers.
   * @returns {string[] | null} - Notification's receivers.
   */
  public getReceivers(): string[] | null {
    return this.receivers;
  }
}
