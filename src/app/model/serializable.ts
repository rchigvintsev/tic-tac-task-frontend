export interface Serializable<T> {
  /**
   * Converts attributes of serialized entity to their client-side representation.
   *
   * @param input serialized entity
   * @return this
   */
  deserialize(input: any): T;

  /**
   * Converts entity to form suitable for transmission over the wire. It may include converting of complex types to
   * their simpler representation understandable on both client and server sides.
   *
   * @return serialized entity
   */
  serialize(): any;
}
